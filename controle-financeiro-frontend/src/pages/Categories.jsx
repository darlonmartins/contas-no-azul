import React, { useEffect, useState } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";
import CategoryModal from "../components/categories/CategoryModal";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      alert("Erro ao excluir categoria.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border p-4 rounded shadow flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon || "📁"}</span>
              <div>
                <p className="font-semibold">{cat.name}</p>
                {cat.children?.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Subcategorias: {cat.children.map((c) => c.name).join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(cat)}
                className="text-blue-600 hover:text-blue-800"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-600 hover:text-red-800"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CategoryModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchCategories}
          category={editingCategory}
        />
      )}
    </div>
  );
};

export default Categories;
