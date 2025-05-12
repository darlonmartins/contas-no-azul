import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');


const MonthlyGoalCard = ({ goal, onEdit, onDelete }) => {
    const formattedMonth = dayjs(goal.month + '-01').format('MMMM [de] YYYY');


    const percentage = goal.percentageUsed ?? 0;
    const roundedPercent = Math.min(Math.round(percentage), 999);

    let status = 'Dentro da meta';
    let barClass = 'bg-green-500';
    let statusClass = 'bg-green-100 text-green-800';

    if (percentage > 100) {
        status = 'Meta extrapolada';
        barClass = 'bg-red-500';
        statusClass = 'bg-red-100 text-red-800';
    } else if (percentage > 80) {
        status = 'Quase no limite';
        barClass = 'bg-yellow-500';
        statusClass = 'bg-yellow-100 text-yellow-800';
    }

    return (
        <div className="border rounded-lg p-4 shadow bg-white flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    {goal.Category?.icon && (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-xl">
                            <span>{goal.Category.icon}</span>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-500">{formattedMonth}</p>
                        <p className="font-semibold text-gray-800">{goal.Category?.name || 'Categoria'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(goal)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-600">Meta:</div>
            <div className="text-lg font-bold text-indigo-600">
                R$ {Number(goal.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            <div className="mt-2 h-2 bg-gray-200 rounded-full w-full">
                <div
                    className={`h-2 rounded-full ${barClass}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Usado: R$ {Number(goal.usedAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>{roundedPercent}%</span>
            </div>

            <div className={`mt-2 text-xs font-medium inline-block px-2 py-1 rounded-full ${statusClass}`}>
                {status}
            </div>
        </div>
    );
};

export default MonthlyGoalCard;
