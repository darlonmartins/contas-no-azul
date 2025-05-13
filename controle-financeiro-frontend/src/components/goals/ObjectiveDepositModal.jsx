import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../../services/api';


const ObjectiveDepositModal = ({ objective, onClose, onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');

  // 🚨 Log para depuração
  useEffect(() => {
    console.log('🎯 Objetivo recebido no modal:', objective);
  }, [objective]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      toast.error('Erro ao carregar contas');
    }
  };

  const formatCurrencyInput = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const numeric = parseFloat(cleaned) / 100;

    if (isNaN(numeric)) return '';
    return numeric.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDeposit = async () => {
    const token = localStorage.getItem('token');

    const parsedAmount = parseFloat(
      amount.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    );

    if (!parsedAmount || parsedAmount <= 0) {
      toast.warning('Informe um valor válido.');
      return;
    }

    if (!accountId) {
      toast.warning('Selecione a conta de origem.');
      return;
    }

    try {
      await api.post(`/goals/${objective.id}/deposit`, {
        amount: parsedAmount,
        accountId,
        date,
      });



      toast.success('Depósito registrado com sucesso!');
      if (onDepositSuccess) onDepositSuccess();
    } catch (err) {
      toast.error('Erro ao registrar depósito.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar depósito</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor a depositar (R$)
          </label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={amount}
            onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
            placeholder="Ex: R$ 500,00"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data do depósito
          </label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conta de origem
          </label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} – Saldo: R$
                {acc.saldoAtual?.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeposit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveDepositModal;
