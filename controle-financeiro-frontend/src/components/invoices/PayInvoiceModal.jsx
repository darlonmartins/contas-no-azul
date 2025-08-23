import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { format } from "date-fns";

console.log("🧾 PayInvoiceModal v2.2 carregado (arquivo importado)");

// Helper: converte "R$ 1.234,56" -> 1234.56 (Number)
const parseCurrencyToNumber = (str) => {
  if (typeof str === "number") return str;
  if (!str) return NaN;
  return Number(
    String(str)
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
  );
};

// Helper: formata número para pt-BR currency
const formatBRL = (num) =>
  Number(num).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PayInvoiceModal = ({ isOpen, onClose, invoice, invoiceValue, onSuccess }) => {
  console.log("🧾 PayInvoiceModal v2.2 montado (componente executando)");

  const [accounts, setAccounts] = useState([]);
  const [paymentDate, setPaymentDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valor esperado/“padrão” da fatura (normalizado como número)
  const expectedAmount = useMemo(() => {
    const n = Number(invoiceValue);
    return Number.isFinite(n) ? n : NaN;
  }, [invoiceValue]);

  // 🔍 Loga sempre que o modal abrir/fechar
  useEffect(() => {
    console.log("🪟 PayInvoiceModal -> isOpen:", isOpen);
  }, [isOpen]);

  // 🔎 Loga o que chega via props
  useEffect(() => {
    console.log("📦 Props recebidas no PayInvoiceModal:");
    console.log("   invoice:", invoice);
    console.log("   invoiceValue (total atual esperado):", invoiceValue);
  }, [invoice, invoiceValue]);

  // 📥 Define valor inicial do campo com base em várias fontes
  useEffect(() => {
    const candidatesRaw = [
      invoiceValue,               // valor explicitamente passado pelo pai (ideal)
      invoice?.currentTotal,      // alguns controllers usam esse nome
      invoice?.invoiceTotal,      // alternativa comum
      invoice?.total,             // total genérico
      invoice?.amount             // às vezes o model Invoice tem 'amount'
    ];

    const candidatesParsed = candidatesRaw.map((v, idx) => {
      const parsed =
        typeof v === "string" ? parseCurrencyToNumber(v) : Number(v);
      console.log(`🧪 Candidate[${idx}] -> raw:`, v, "| parsed:", parsed);
      return parsed;
    });

    const base = candidatesParsed.find((v) => !isNaN(v) && v > 0) ?? 0;

    console.log("🧮 base identificada para preencher o campo:", base);

    if (base > 0) {
      const formatted = formatBRL(base);
      console.log("🔧 Setando amount inicial com:", formatted);
      setAmount(formatted);
    } else {
      console.log("⚠️ Nenhum candidato válido encontrado; mantendo amount atual:", amount);
    }
  }, [invoice, invoiceValue]);

  // 📡 Buscar contas ao abrir
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log("🛰️ GET /accounts (carregando carteiras) ...");
        const res = await api.get("/accounts");
        console.log("📡 Contas carregadas:", res.data);
        setAccounts(res.data);
      } catch (err) {
        console.error("❌ Erro ao carregar contas:", err?.response?.data || err);
      }
    };

    if (isOpen && invoice) {
      console.log("🔔 Modal abriu com invoice.id:", invoice?.id);
      fetchAccounts();
    }
  }, [isOpen, invoice]);

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.warn("⏳ Submit ignorado (já em andamento)...");
      return;
    }

    console.log("🔁 Iniciando envio do pagamento...");
    console.log("🧾 invoice.id:", invoice?.id);
    console.log("💳 accountId:", accountId);
    console.log("📅 paymentDate:", paymentDate);
    console.log("💰 amount (string):", amount);

    if (!invoice?.id) {
      toast.error("Fatura inválida.");
      console.error("❌ ID da fatura não informado.");
      return;
    }

    if (!accountId || !amount) {
      toast.error("Preencha todos os campos.");
      console.warn("⚠️ Campos obrigatórios faltando:", { accountId, amount });
      return;
    }

    const valorNumerico = parseCurrencyToNumber(amount);
    console.log("🔢 Valor numérico convertido:", valorNumerico, "| esperado (invoiceValue):", expectedAmount);

    if (isNaN(valorNumerico)) {
      toast.error("Valor inválido.");
      console.error("❌ Valor inválido após conversão:", amount);
      return;
    }

    if (Number.isFinite(expectedAmount) && Math.abs(valorNumerico - expectedAmount) > 0.01) {
      console.warn("🟠 Aviso: valor digitado difere do esperado!", {
        esperado: expectedAmount,
        digitado: valorNumerico,
      });
    }

    const payload = {
      amount: valorNumerico,
      paymentDate,
      accountId,
    };
    console.log("📤 Enviando PUT /invoices/:id/pay", { invoiceId: invoice.id, payload });

    try {
      setIsSubmitting(true);

      const res = await api.put(`/invoices/${invoice.id}/pay`, payload);
      console.log("✅ Resposta do PUT /invoices/:id/pay:", {
        status: res?.status,
        data: res?.data
      });

      toast.success("Fatura paga com sucesso!");
      console.log("✅ Pagamento enviado com sucesso.");

      onClose?.();
      onSuccess?.();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("❌ Erro ao pagar fatura:", { status, data, err });
      toast.error(data?.message || "Erro ao marcar fatura como paga.");
    } finally {
      setIsSubmitting(false);
      console.log("🏁 handleSubmit finalizado");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30 px-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-4">Pagamento da Fatura</Dialog.Title>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Valor Pago</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={amount}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                const numeric = Number(onlyDigits) / 100;
                const formatted = formatBRL(numeric);
                console.log("⌨️ Digitando valor:", e.target.value, "➡️", formatted);
                setAmount(formatted);
              }}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Data de Pagamento</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={paymentDate}
              onChange={(e) => {
                console.log("🗓️ Alterando paymentDate:", e.target.value);
                setPaymentDate(e.target.value);
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Carteira Utilizada</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={accountId}
              onChange={(e) => {
                console.log("👛 Alterando accountId:", e.target.value);
                setAccountId(e.target.value);
              }}
            >
              <option value="">Selecione</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (R$ {parseFloat(acc.saldoAtual).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isSubmitting ? "Enviando..." : "Confirmar Pagamento"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PayInvoiceModal;
