import React, { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CardModal = ({ isOpen, onClose, onSubmit, editingCard }) => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    limit: "",
    dueDate: "",
    fechamento: "",
  });

  const [success, setSuccess] = useState(false);
  const [wasEditing, setWasEditing] = useState(false);

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
        fechamento: editingCard.fechamento?.toString() || "",
      });
    } else if (isOpen) {
      setForm({ name: "", brand: "", limit: "", dueDate: "", fechamento: "" });
    }
  }, [editingCard, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "limit") {
      const numeric = value.replace(/\D/g, "");
      const formatted = (Number(numeric) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const limit = parseFloat(form.limit.replace(/[^\d,-]/g, "").replace(",", "."));
    setWasEditing(!!editingCard);
    onSubmit({ ...form, limit });
    setSuccess(true);
  };

  const resetForm = () => {
    setForm({ name: "", brand: "", limit: "", dueDate: "", fechamento: "" });
    setSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-md shadow-xl w-full max-w-md relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            {!success ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  {editingCard ? "Editar Cartão" : "Adicionar Cartão"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Nome do Cartão</label>
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
                    <label className="block text-sm font-medium">Bandeira</label>
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
                    <label className="block text-sm font-medium">Limite</label>
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
                    <label className="block text-sm font-medium">Dia de Vencimento</label>
                    <input
                      type="number"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="31"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Fechamento (melhor dia de compra)</label>
                    <input
                      type="number"
                      name="fechamento"
                      value={form.fechamento}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="31"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium mt-2"
                  >
                    {editingCard ? "Atualizar Cartão" : "Adicionar Cartão"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <CheckCircle className="text-green-600 mx-auto" size={48} />
                <h3 className="text-xl font-bold">
                  {wasEditing
                    ? "Cartão atualizado com sucesso."
                    : "Cartão cadastrado com sucesso."}
                </h3>
                {!wasEditing && (
                  <p className="text-gray-600">Já pode começar a registrar seus gastos e transações.</p>
                )}
                <div className="space-y-2">
                  {!wasEditing && (
                    <button
                      onClick={resetForm}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium"
                    >
                      Adicionar outro cartão
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      onClose();
                    }}
                    className="w-full border border-green-600 text-green-600 py-2 rounded font-medium hover:bg-green-50"
                  >
                    {wasEditing ? "Fechar" : "Agora não"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CardModal;
