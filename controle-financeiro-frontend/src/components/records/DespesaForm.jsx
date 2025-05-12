import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle2 } from "lucide-react";

const DespesaForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    type: "expense",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };

    fetchCategories();
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
      type: "expense",
      categoryId: "",
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/transactions", {
        ...form,
        amount: parseFloat(form.amount),
        type: "expense",
      });

      setSuccess(true);
      if (onSave) onSave(); // 🔁 atualiza listagem
    } catch (err) {
      console.error("Erro ao registrar despesa:", err);
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
              placeholder="Ex: Aluguel"
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
              placeholder="Ex: 800.00"
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

          <div className="text-right pt-2">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Registrar Despesa
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DespesaForm;
