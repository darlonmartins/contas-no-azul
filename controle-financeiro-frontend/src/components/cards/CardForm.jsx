import React, { useEffect, useState } from "react";

const CardForm = ({ onSubmit, editingCard, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    limit: "",
    dueDate: "",
  });

  const brands = ["Visa", "Mastercard", "Elo", "Hipercard", "American Express", "Outro"];

  useEffect(() => {
    if (editingCard) {
      setForm({
        name: editingCard.name,
        brand: editingCard.brand,
        limit: editingCard.limit.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        dueDate: editingCard.dueDate.toString(),
      });
    } else {
      setForm({ name: "", brand: "", limit: "", dueDate: "" });
    }
  }, [editingCard]);

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "limit") {
    const raw = value.replace(/\D/g, "");
    const numeric = Number(raw) / 100;

    const formatted = numeric.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setForm((prev) => ({ ...prev, limit: formatted }));
  } else {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    const limit = parseFloat(
  form.limit.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
);

    onSubmit({ ...form, limit });
    setForm({ name: "", brand: "", limit: "", dueDate: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-2">
      <div>
        <label className="block mb-1 text-sm font-medium">Nome do Cartão</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Bandeira</label>
        <select
          name="brand"
          value={form.brand}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Selecione...</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Limite</label>
        <input
          type="text"
          name="limit"
          value={form.limit}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          inputMode="numeric"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Dia de Vencimento</label>
        <input
          type="number"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          min="1"
          max="31"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          
          {editingCard ? "Atualizar Cartão" : "Salvar Cartão"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CardForm;
