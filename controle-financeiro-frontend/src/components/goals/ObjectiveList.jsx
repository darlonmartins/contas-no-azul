import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';

const ObjectiveList = ({ objectives, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const iconMap = {
    'novo carro': '🚗',
    'nova casa': '🏠',
    'viagem de férias': '✈️',
    'educação': '🎓',
    'fundo de emergência': '💰',
    'saúde': '❤️',
    'festa': '🎉',
    'filhos': '👶',
    'aposentadoria': '🏖️',
    'quitar uma dívida': '💳',
  };

  const getIcon = (name) => {
    const key = name?.toLowerCase()?.trim();
    return iconMap[key] || '🎯';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {objectives.map((obj) => (
        <div
          key={obj.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition flex flex-col gap-2 cursor-pointer"
          onClick={() => navigate(`/objectives/${obj.id}`)} // ✅ novo path
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span>{getIcon(obj.name)}</span>
              {obj.name}
            </h3>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEdit(obj)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(obj.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-800 font-bold">
            Valor: R${' '}
            {Number(obj.targetAmount).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </p>

          <p className="text-sm text-gray-600">
            Prazo: {new Date(obj.dueDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ObjectiveList;
