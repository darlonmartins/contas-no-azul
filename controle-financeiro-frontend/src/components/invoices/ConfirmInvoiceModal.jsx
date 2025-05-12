import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmInvoiceModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Cabeçalho com ícone */}
        <div className="flex items-center mb-4 text-yellow-600">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <h2 className="text-lg font-semibold">Confirmação de Fatura</h2>
        </div>

        {/* Mensagem */}
        <p className="text-sm text-gray-700 mb-6">{message}</p>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmInvoiceModal;
