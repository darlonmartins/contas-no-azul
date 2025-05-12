import React from "react";
import { Dialog } from "@headlessui/react";
import { CheckCircle } from "lucide-react";
import api from "../../services/api";

const InvoiceModal = ({ isOpen, onClose, invoice, onPaid }) => {
  if (!invoice) return null;

  const handleMarkAsPaid = async () => {
    try {
      await api.put(`/invoices/${invoice.id}/pay`);
      await onPaid(); // ⬅️ aguarda para garantir atualização antes de fechar
      onClose();
    } catch (err) {
      console.error("Erro ao marcar fatura como paga:", err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <Dialog.Title className="text-lg font-semibold mb-2">
              Marcar Fatura como Paga?
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Deseja marcar a fatura do mês <strong>{invoice.month}</strong> como paga?
            </p>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InvoiceModal;
