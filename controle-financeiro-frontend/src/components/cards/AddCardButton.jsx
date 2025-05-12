import React from "react";
import { CreditCard, PlusCircle } from "lucide-react";

const AddCardButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
    >
      <CreditCard size={18} />
      <span className="font-medium">Cadastrar Novo Cartão</span>
      <PlusCircle size={18} />
    </button>
  );
};

export default AddCardButton;