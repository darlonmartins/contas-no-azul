import React, { useState, useEffect } from "react";
import { X, PlusCircle, Trash2 } from "lucide-react";
import api from "../../services/api";

const CategoryModal = ({ onClose, onSave, category }) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  const [iconOptions, setIconOptions] = useState([]);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setIcon(category.icon || "");
      setSubcategories(category.children?.map((c) => c.name) || []);
    } else {
      setName("");
      setIcon("");
      setSubcategories([""]);
    }
  }, [category]);

  // 🔄 Buscar ícones únicos do backend
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await api.get("/categories/icons");
        setIconOptions(response.data);
      } catch (err) {
        console.error("Erro ao carregar ícones:", err);
      }
    };
    fetchIcons();
  }, []);

  const handleSubChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const addSubcategory = () => {
    setSubcategories([...subcategories, ""]);
  };

  const removeSubcategory = (index) => {
    const updated = [...subcategories];
    updated.splice(index, 1);
    setSubcategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      icon,
      subcategories: subcategories.filter((s) => s.trim() !== ""),
    };

    try {
      if (category) {
        await api.put(`/categories/${category.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {category ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da categoria</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ícone</label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`text-xl border rounded p-2 hover:bg-gray-100 ${
                    icon === ic ? "bg-gray-200 border-blue-500" : ""
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subcategorias</label>
            {subcategories.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => handleSubChange(idx, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder={`Subcategoria ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeSubcategory(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSubcategory}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
            >
              <PlusCircle size={16} /> Adicionar subcategoria
            </button>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {category ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
