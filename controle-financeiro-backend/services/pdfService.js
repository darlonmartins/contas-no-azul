const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const path = require('path');
const { Transaction, Category, Account, Card } = require('../models');

const brMoney = (v) =>
  `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const safe = (s) => (s == null ? '' : String(s));

async function fetchMonthlyData({ userId, month, categoryId }) {
  // período do mês
  const base = month ? dayjs(`${month}-01`) : dayjs().startOf('month');
  const start = base.startOf('month').format('YYYY-MM-DD');
  const end = base.endOf('month').format('YYYY-MM-DD');

  const where = { userId, date: { [Op.between]: [start, end] } };
  if (categoryId) where.categoryId = categoryId;

  const [transactions, accounts, cards, categories] = await Promise.all([
    Transaction.findAll({ where, order: [['date', 'ASC'], ['id', 'ASC']] }),
    Account.findAll({ where: { userId } }),
    Card.findAll({ where: { userId } }),
    Category.findAll({ where: { userId } }),
  ]);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const cartao = transactions
    .filter((t) => t.type === 'despesa_cartao')
    .reduce((s, t) => s + Number(t.amount), 0);

  // por categoria
  const byCat = {};
  for (const t of transactions) {
    const key = t.categoryId || 'sem';
    byCat[key] = (byCat[key] || 0) + Number(t.amount || 0);
  }

  const catIndex = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const byCategoryArr = Object.entries(byCat)
    .map(([id, total]) => ({
      id: id === 'sem' ? null : Number(id),
      name:
        id === 'sem' ? 'Sem categoria' : catIndex[id] || `Categoria ${id}`,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  const balanceTotal = accounts.reduce(
    (s, a) => s + Number(a.saldoAtual || 0),
    0
  );

  return {
    start,
    end,
    monthLabel: base.format('MMMM [de] YYYY'),
    income,
    expense,
    cartao,
    balanceTotal,
    transactions,
    byCategoryArr,
    accounts,
    cards,
    catIndex,
  };
}

function tableHeader(doc, x, y, widths, headers) {
  doc.fontSize(10).fillColor('#374151'); // gray-700
  let curX = x;
  headers.forEach((h, i) => {
    doc.text(h, curX, y);
    curX += widths[i];
  });
  doc
    .moveTo(x, y + 14)
    .lineTo(x + widths.reduce((a, b) => a + b, 0), y + 14)
    .strokeColor('#e5e7eb') // gray-200
    .stroke();
}

function tableRow(doc, x, y, widths, cells, colorMap = {}) {
  doc.fontSize(10);
  let curX = x;
  cells.forEach((c, i) => {
    const fill = colorMap[i] || '#111827'; // default gray-900
    doc.fillColor(fill).text(String(c), curX, y, { width: widths[i] - 4 });
    curX += widths[i];
  });
}

function drawSectionTitle(doc, text) {
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#111827').text(text);
  doc.moveDown(0.5);
}

function drawCardsRow(doc, items) {
  const cardY = doc.y;
  const colW = 170;
  const gap = 12;

  const drawCard = (x, title, value, color = '#111827') => {
    doc
      .roundedRect(x, cardY, colW, 60, 8)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();
    doc.fillColor('#6b7280').fontSize(10).text(title, x + 10, cardY + 10);
    doc.fillColor(color).fontSize(14).text(value, x + 10, cardY + 28);
  };

  items.forEach((it, idx) => {
    drawCard(doc.x + idx * (colW + gap), it.title, it.value, it.color);
  });

  doc.moveDown(5);
}

function maybeNewPageWithHeader(doc, y, x, widths, headers) {
  if (y > 760) {
    doc.addPage();
    const headY = 60;
    tableHeader(doc, x, headY, widths, headers);
    return headY + 20;
  }
  return y;
}

/**
 * Gera o PDF e escreve no stream dado (res).
 * @param {{ userId: number, month?: string, categoryId?: number }} params
 * @param {import('express').Response} res
 * @param {{ id: number, name?: string, email?: string }} user
 */
async function generateMonthlyReport(params, res, user = {}) {
  const data = await fetchMonthlyData(params);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(res);

  // ---------- Cabeçalho ----------
  // (opcional) logo: coloque seu arquivo em /public/logo.png ou /assets/logo.png
  try {
    const logoPathCandidates = [
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(process.cwd(), 'assets', 'logo.png'),
    ];
    for (const p of logoPathCandidates) {
      // tentativa silenciosa (não quebra se não existir)
      doc.image(p, 40, 34, { width: 110 });
      break;
    }
  } catch (_) {
    // sem logo, segue o jogo
  }

  const userLine =
    safe(user?.name) || safe(user?.email) || `Usuário #${params.userId}`;
  doc
    .fontSize(18)
    .fillColor('#111827')
    .text('Relatório Financeiro Mensal', 40, 40);
  doc
    .fontSize(10)
    .fillColor('#6b7280')
    .text(`Usuário: ${userLine}`)
    .text(
      `Período: ${dayjs(data.start).format('DD/MM/YYYY')} a ${dayjs(
        data.end
      ).format('DD/MM/YYYY')}`
    )
    .text(`Gerado em: ${dayjs().format('DD/MM/YYYY HH:mm')}`);

  // Filtros
  const filtroCat = params.categoryId
    ? `Categoria: ${data.catIndex[params.categoryId] || params.categoryId}`
    : 'Todas as categorias';
  doc.text(`Filtros: ${filtroCat}`);
  doc.moveDown(1);

  // ---------- Cards (resumo) ----------
  drawCardsRow(doc, [
    { title: 'Saldo total das contas', value: brMoney(data.balanceTotal), color: '#10b981' }, // emerald-500
    { title: 'Receitas no mês', value: brMoney(data.income), color: '#16a34a' }, // green-600
    { title: 'Despesas no mês', value: brMoney(data.expense), color: '#ef4444' }, // red-500
    { title: 'Despesas (cartão)', value: brMoney(data.cartao), color: '#8b5cf6' }, // violet-500
  ]);

  // ---------- Top categorias ----------
  drawSectionTitle(doc, 'Categorias que mais consomem');
  const top = data.byCategoryArr.slice(0, 8);
  if (top.length === 0) {
    doc.fontSize(10).fillColor('#6b7280').text('Sem despesas no período.');
  } else {
    const widths = [260, 140];
    tableHeader(doc, doc.x, doc.y, widths, ['Categoria', 'Total']);
    let y = doc.y + 20;
    for (const c of top) {
      y = maybeNewPageWithHeader(doc, y, doc.x, widths, ['Categoria', 'Total']);
      tableRow(doc, doc.x, y, widths, [c.name, brMoney(c.total)]);
      y += 18;
    }
    doc.moveDown(1.5);
  }

  // ---------- Transações do período ----------
  drawSectionTitle(doc, 'Transações do período');
  if (data.transactions.length === 0) {
    doc.fontSize(10).fillColor('#6b7280').text('Nenhuma transação registrada no período.');
  } else {
    const widths = [80, 230, 110, 80];
    const headers = ['Data', 'Descrição', 'Categoria', 'Valor'];
    tableHeader(doc, doc.x, doc.y, widths, headers);
    let y = doc.y + 20;

    for (const t of data.transactions) {
      y = maybeNewPageWithHeader(doc, y, doc.x, widths, headers);

      const catName =
        t.categoryId && data.catIndex[t.categoryId]
          ? data.catIndex[t.categoryId]
          : t.categoryId
          ? `Categoria ${t.categoryId}`
          : '-';

      const amount = Number(t.amount || 0);
      const cells = [
        dayjs(t.date).format('DD/MM'),
        safe(t.description || '-'),
        catName,
        brMoney(amount),
      ];

      // valor negativo/saída em vermelho
      const isOut =
        t.type === 'expense' || t.type === 'despesa_cartao' || amount < 0;
      const colorMap = { 3: isOut ? '#ef4444' : '#111827' }; // só a célula do valor

      tableRow(doc, doc.x, y, widths, cells, colorMap);
      y += 18;
    }
  }

  // ---------- Rodapé ----------
  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor('#9ca3af')
    .text('Contas no Azul • Relatório mensal', { align: 'center' });

  doc.end();
}

module.exports = { generateMonthlyReport };
