import React from "react";
import TransactionModal from "./TransactionModal";

const ModalRegistro = ({ isOpen, onClose, activeTab, onSave }) => {
  if (!isOpen) return null;

const mapTabToType = {
  ganho: "ganho",
  despesa: "despesa",
  despesa_cartao: "despesa_cartao",
  transferencia: "transferencia",
};


  const mapTabToTitle = {
    ganho: "Registrar Ganho",
    despesa: "Registrar Despesa",
    despesa_cartao: "Registrar Despesa com Cartão",
    transferencia: "Registrar Transferência",
  };

  const initialType = mapTabToType[activeTab] || "despesa";
  const customTitle = mapTabToTitle[activeTab] || "Registrar Transação";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <TransactionModal
          transaction={null}
          onClose={onClose}
          onSave={onSave}
          initialType={initialType}
          customTitle={customTitle}
        />
      </div>
    </div>
  );
};

export default ModalRegistro;
