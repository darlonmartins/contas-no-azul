import React from "react";
import { Trash2 } from "lucide-react";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Excluir item?",
  message = "Esta ação não poderá ser desfeita.",
  confirmText = "Excluir"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <Trash2 size={40} className="text-red-600" />
        </div>
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
