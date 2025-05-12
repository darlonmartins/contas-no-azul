import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle2 } from "lucide-react";

const DespesaCartaoForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    type: "expense",
    categoryId: "",
    cardId: "",
    isInstallment: false,
    totalInstallments: 1,
    currentInstallment: 1,
  });

  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, cardRes] = await Promise.all([
          api.get("/categories"),
          api.get("/cards"),
        ]);
        setCategories(catRes.data);
        setCards(cardRes.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      date: "",
      type: "expense",
      categoryId: "",
      cardId: "",
      isInstallment: false,
      totalInstallments: 1,
      currentInstallment: 1,
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transactions", {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess(true);
      if (onSave) onSave(); // 🔁 recarrega listagem
    } catch (err) {
      console.error("Erro ao registrar despesa com cartão:", err);
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
            Despesa registrada com sucesso.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={resetForm}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Adicionar outra despesa
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
              placeholder="Ex: Mercado"
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
              placeholder="Ex: 150.00"
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
            <label className="block text-sm font-medium">Categoria</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Selecione</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Cartão</label>
            <select
              name="cardId"
              value={form.cardId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Selecione</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.brand})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isInstallment"
              checked={form.isInstallment}
              onChange={handleChange}
            />
            <label className="text-sm">Parcelado?</label>
          </div>

          {form.isInstallment && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Parcela atual</label>
                <input
                  type="number"
                  name="currentInstallment"
                  value={form.currentInstallment}
                  onChange={handleChange}
                  min={1}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Total de parcelas</label>
                <input
                  type="number"
                  name="totalInstallments"
                  value={form.totalInstallments}
                  onChange={handleChange}
                  min={1}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
          )}

          <div className="text-right pt-2">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Registrar Despesa com Cartão
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DespesaCartaoForm;
