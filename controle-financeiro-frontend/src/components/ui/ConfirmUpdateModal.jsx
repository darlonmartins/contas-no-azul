import React from "react";

const ConfirmUpdateModal = ({ isOpen, onClose, onConfirm, onCancel, message }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <p className="text-center mb-6 text-gray-700">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Sim
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Não
            </button>
          </div>
        </div>
      </div>
    );
  };
  

export default ConfirmUpdateModal;
