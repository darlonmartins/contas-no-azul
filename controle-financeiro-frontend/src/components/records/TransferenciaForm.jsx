import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle2 } from "lucide-react";

const TransferenciaForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    type: "transfer",
    originAccountId: "",
    destinationAccountId: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      }
    };

    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      date: "",
      type: "transfer",
      originAccountId: "",
      destinationAccountId: "",
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.originAccountId === form.destinationAccountId) {
      alert("A conta de origem e destino devem ser diferentes.");
      return;
    }

    try {
      await api.post("/transactions", {
        ...form,
        amount: parseFloat(form.amount),
      });

      setSuccess(true);
      if (onSave) onSave(); // 🔁 recarrega listagem
    } catch (err) {
      console.error("Erro ao registrar transferência:", err);
    }
  };

  return (
    <div>
      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <p className="text-green-700 text-lg font-semibold">
            Transferência registrada com sucesso.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={resetForm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Adicionar outra transferência
            </button>
            <button
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Agora não
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="Ex: Transferência para Poupança"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Valor</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="Ex: 250.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Data</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Conta de origem</label>
            <select
              name="originAccountId"
              value={form.originAccountId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecione</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bank})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Conta de destino</label>
            <select
              name="destinationAccountId"
              value={form.destinationAccountId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecione</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bank})
                </option>
              ))}
            </select>
          </div>

          <div className="text-right pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Registrar Transferência
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransferenciaForm;
