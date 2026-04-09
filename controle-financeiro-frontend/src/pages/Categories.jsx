import React, { useEffect, useState } from "react";
import { PlusCircle, Pencil, Trash2, FolderKanban } from "lucide-react";
import api from "../services/api";
import CategoryModal from "../components/categories/CategoryModal";

const Categories = () => {
  const [categories, setCategories]         = useState([]);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading]               = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      alert("Erro ao excluir categoria.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 12, color: "#94a3b8" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14 }}>Carregando categorias...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cat-page { font-family: 'DM Sans', sans-serif; }
        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .cat-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 9px; border: none; background: #0f172a; color: #fff; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .cat-btn-primary:hover { background: #1e293b; }
        .cat-card { background: #fff; border: 1.5px solid #f1f5f9; border-radius: 14px; padding: 16px 18px; transition: box-shadow 0.15s; }
        .cat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .cat-action-btn { width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
      `}</style>

      <div className="cat-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.4px", margin: "0 0 4px" }}>Categorias</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              {categories.length} categoria{categories.length !== 1 ? "s" : ""} cadastrada{categories.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="cat-btn-primary" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} /> Nova categoria
          </button>
        </div>

        {/* Grid de categorias */}
        {categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <FolderKanban size={26} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>Nenhuma categoria</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>Crie categorias para organizar suas transações.</p>
            <button className="cat-btn-primary" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
              <PlusCircle size={15} /> Criar categoria
            </button>
          </div>
        ) : (
          <div className="cat-grid">
            {categories.map(cat => (
              <div key={cat.id} className="cat-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  {/* Ícone + nome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {cat.icon || "📁"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{cat.name}</div>
                      {cat.children?.length > 0 && (
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          {cat.children.length} subcategoria{cat.children.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <button
                      className="cat-action-btn"
                      onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                      title="Editar"
                      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Pencil size={14} color="#64748b" />
                    </button>
                    <button
                      className="cat-action-btn"
                      onClick={() => setConfirmDeleteId(cat.id)}
                      title="Excluir"
                      onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>

                {/* Subcategorias */}
                {cat.children?.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cat.children.map(sub => (
                      <span key={sub.id} style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 999, background: "#f8fafc", color: "#64748b", border: "1px solid #f1f5f9" }}>
                        {sub.icon && <span style={{ marginRight: 3 }}>{sub.icon}</span>}
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CategoryModal
          onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
          onSave={fetchCategories}
          category={editingCategory}
        />
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>Excluir categoria</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Deseja realmente excluir esta categoria? As subcategorias também serão removidas.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ flex: 1, padding: 10, borderRadius: 9, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
