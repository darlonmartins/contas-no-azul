import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { format } from "date-fns";

const PayInvoiceModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const [accounts, setAccounts] = useState([]);
  const [paymentDate, setPaymentDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState(invoice?.total || "");
  const [accountId, setAccountId] = useState("");

  // ✅ Atualiza o valor da fatura quando a invoice muda
  useEffect(() => {
    if (invoice?.amount) {
      console.log("📥 Atualizando valor da fatura (amount):", invoice.amount);
      setAmount(invoice.amount);
    }
  }, [invoice]);

  // ✅ Logs para depuração de entrada
 useEffect(() => {
    if (invoice) {
      console.log("🧾 Fatura recebida na modal:", invoice);
      console.log("💰 Valor da fatura (invoice.amount):", invoice.amount);
    }
  }, [invoice]);

  // ✅ Carrega as contas toda vez que abrir a modal com nova fatura
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        console.log("💼 Contas retornadas pela API:", res.data);
        setAccounts(res.data);
      } catch (err) {
        console.error("❌ Erro ao carregar contas:", err);
      }
    };
  
    if (isOpen && invoice) {
      console.log("📡 Disparando fetch de contas...");
      fetchAccounts();
    }
  }, [isOpen, invoice]);
  

  const handleSubmit = async () => {
    if (!accountId || !amount || isNaN(amount)) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    try {
      console.log("✅ Enviando pagamento da fatura:", {
        invoiceId: invoice.id,
        amount,
        paymentDate,
        accountId,
      });

      await api.put(`/invoices/${invoice.id}/pay`, {
        amount,
        paymentDate,
        accountId,
      });

      toast.success("Fatura paga com sucesso!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("❌ Erro  pagar fatura:", err);
      toast.error("Erro ao marcar fatura como paga.");
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
              type="number"
              className="w-full border rounded px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Data de Pagamento</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Carteira Utilizada</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
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
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirmar Pagamento
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PayInvoiceModal;
