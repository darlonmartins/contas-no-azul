import React from 'react';

const CardList = ({ cards, onEdit, onDelete }) => {
  if (!cards.length) {
    return <p className="text-gray-500">Nenhum cartão cadastrado.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cards.map((card) => (
        <div key={card.id} className="border p-4 rounded shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">{card.name}</h3>
          <p className="text-sm text-gray-700">Bandeira: {card.brand}</p>
          <p className="text-sm text-gray-700">
            Limite: R$ {Number(card.limit).toFixed(2)}
          </p>
          <p className="text-sm text-gray-700">
            Vencimento: Dia {card.dueDate}
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(card)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardList;
