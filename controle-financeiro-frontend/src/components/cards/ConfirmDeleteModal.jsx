import React from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel, cardName, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-xl p-6 w-full max-w-sm relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          disabled={loading}
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="text-red-600" />
          <h2 className="text-lg font-bold">Excluir Cartão</h2>
        </div>
        <p className="mb-6 text-gray-700">
          Tem certeza que deseja excluir o cartão <strong>{cardName}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Aguarde...
              </>
            ) : (
              "Excluir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
