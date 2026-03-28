import React, { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

function smToMonthKey(sm) {
  // "09/2025" -> "2025-09"
  if (!sm || !/\d{2}\/\d{4}/.test(sm)) return null;
  const [mm, yyyy] = sm.split("/");
  return `${yyyy}-${mm}`;
}

export default function AttachInvoiceModal({ open, onClose, cardId, month, onDone }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const [invoiceId, setInvoiceId] = useState(null);
  const [invoiceMeta, setInvoiceMeta] = useState(null); // { bank, statementMonth, closingDate, dueDate }
  const [preview, setPreview] = useState(null);         // { invoice, rows: [] }
  const [result, setResult] = useState(null);           // { imported, skipped }

  function reset() {
    setFile(null);
    setBusy(false);
    setInvoiceId(null);
    setInvoiceMeta(null);
    setPreview(null);
    setResult(null);
  }

  async function upload() {
    if (!file) throw new Error("Selecione um PDF");
    if (!cardId) throw new Error("Selecione um cartão");

    const fd = new FormData();
    fd.append("file", file, file.name);   // 👈 o campo TEM que ser 'file'
    fd.append("cardId", String(cardId));

    try {
    const { data } = await api.post("/invoices/upload", fd);
    setInvoiceId(data.id);
    setInvoiceMeta(data);
    return data;
  } catch (err) {
    if (err.response?.status === 409 && err.response?.data?.id) {
      // pode ou não ter metadados no 409; se tiver, guarda
      const data = err.response.data;
      setInvoiceId(data.id);
      if (data.bank || data.statementMonth || data.closingDate || data.dueDate) {
        setInvoiceMeta(data);
      }
      toast.info("Fatura já existia; seguindo com o processamento...");
      return { id: data.id };
    }
    throw err;
  }

  }

  async function parsePDF(id) {
    const { data } = await api.post(`/invoices/${id}/parse`);
    return data; // { parsed: n, ... }
  }

  async function loadPreview(id) {
    const { data } = await api.get(`/invoices/${id}/preview`);
    setPreview(data);
    return data; // { rows: [...] }
  }

  async function importRows(id) {
    const { data } = await api.post(`/invoices/${id}/import`);
    setResult(data); // { imported, skipped }
    return data;
  }

  async function createOrUpdateInvoice() {
    // prioriza mês detectado do PDF; se não vier, usa o mês selecionado na página
    const monthKey = smToMonthKey(invoiceMeta?.statementMonth) || month;
    if (!monthKey) return;
    await api.post("/invoices/create", { cardId: Number(cardId), month: monthKey });
  }

  async function runAll() {
    try {
      setBusy(true);
      setResult(null);
      setPreview(null);

      const up = await upload();
      toast.success(`Upload ok (invoiceId=${up.id})`);

      const p = await parsePDF(up.id);
      toast.success(`Parse ok (${p.parsed} linhas)`);

      await loadPreview(up.id);

      const imp = await importRows(up.id);
      toast.success(`Importados: ${imp.imported} · Ignorados: ${imp.skipped}`);

      await createOrUpdateInvoice();
      toast.success("Fatura criada/atualizada");

      // 🔁 avisa o pai + fecha o modal + limpa estado
      if (typeof onDone === "function") await onDone();
      reset();
      onClose?.();
    } catch (e) {
      console.error("[INV] erro:", e);
      console.log("[INV] resp err:", e.response?.status, e.response?.data);
      toast.error(e?.response?.data?.message || e.message || "Falha ao processar fatura");
    } finally {
      setBusy(false);
    }
  }


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Anexar Fatura do Cartão</h3>
          <button
            className="text-slate-500 hover:text-slate-800"
            onClick={() => {
              reset();
              onClose?.();
            }}
            disabled={busy}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Arquivo PDF</label>
            <input
              type="file"
              accept="application/pdf"
              className="mt-1 block w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cartão</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-50"
              value={cardId || ""}
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">mês atual: {month || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-xl bg-violet-600 text-white disabled:opacity-50"
            onClick={runAll}
            disabled={busy || !file}
          >
            {busy ? "Processando…" : "Processar (upload → parse → importar)"}
          </button>
          {invoiceId && (
            <span className="text-sm text-slate-600">
              invoiceId: <span className="font-mono">{invoiceId}</span>
            </span>
          )}
        </div>

        {/* meta do PDF */}
        {invoiceMeta && (
          <div className="text-sm text-slate-700">
            Banco: <b>{invoiceMeta.bank || "—"}</b> · Fechamento: {invoiceMeta.closingDate || "—"} ·
            Vencimento: {invoiceMeta.dueDate || "—"} · Mês: {invoiceMeta.statementMonth || "—"}
          </div>
        )}

        {/* preview das linhas */}
        {Array.isArray(preview?.rows) && preview.rows.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-100 text-sm">
              {preview?.rows?.length} linhas parseadas
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Descrição</th>
                    <th className="px-3 py-2 text-right">Valor (R$)</th>
                    <th className="px-3 py-2 text-center">Parcela</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr key={i} className={i % 2 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2">
                        {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2">{r.description}</td>
                      <td className="px-3 py-2 text-right">
                        {Number(r.amount).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.installmentNumber
                          ? `${r.installmentNumber}/${r.totalInstallments || "?"}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* resultado do import */}
        {result && (
          <div className="text-sm text-slate-700">
            Importação: <b>{result.imported}</b> inseridas · <b>{result.skipped}</b> ignoradas
          </div>
        )}
      </div>
    </div>
  );
}
