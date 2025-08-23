import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * CategorySelector (Combobox com busca)
 * - Mostra categorias e subcategorias (identadas)
 * - Busca por nome (case-insensitive)
 * - Teclas: ArrowUp/Down, Enter, Esc
 * - onChange recebe: "" (todas) OU { id, name }
 *
 * Espera categories no formato:
 * [
 *   { id, name, children: [{ id, name }, ...] },
 *   ...
 * ]
 */
const CategorySelector = ({ value, onChange, categories = [], className = "" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1); // item focado na lista
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Valor selecionado: "" OU { id, name }
  const selected = useMemo(() => {
    if (value && typeof value === "object") return value;
    return null;
  }, [value]);

  // Flatten: cria uma lista com pais e filhos
  const flatItems = useMemo(() => {
    const items = [];
    categories.forEach((cat) => {
      items.push({ id: String(cat.id), name: cat.name, isChild: false, parentId: null });
      (cat.children || []).forEach((sub) => {
        items.push({ id: String(sub.id), name: sub.name, isChild: true, parentId: String(cat.id) });
      });
    });
    return items;
  }, [categories]);

  // Filtra por query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatItems;
    return flatItems.filter((it) => it.name.toLowerCase().includes(q));
  }, [flatItems, query]);

  // Atualiza activeIndex ao abrir/filtrar
  useEffect(() => {
    if (!open) return;
    setActiveIndex(filtered.length > 0 ? 0 : -1);
  }, [open, filtered.length]);

  // Fecha ao clicar fora
  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectAll = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const selectItem = (item) => {
    onChange({ id: Number(item.id), name: item.name });
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex === -1) return;
      const item = filtered[activeIndex];
      if (item) selectItem(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`} ref={containerRef}>
      <label className="text-sm font-medium text-gray-700 mb-1">Categoria:</label>

      <div className="relative">
        {/* Campo com valor selecionado visível e busca livre */}
        <input
          ref={inputRef}
          type="text"
          className="w-full border rounded px-3 h-10 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Todas as categorias"
          value={
            open
              ? query
              : selected
              ? selected.name
              : ""
          }
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {/* Botão limpar/abrir */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {selected && !open && (
            <button
              title="Limpar"
              className="text-gray-400 hover:text-gray-600"
              onClick={selectAll}
            >
              ✕
            </button>
          )}
          <button
            title="Abrir"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => {
              setOpen((s) => !s);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            ▾
          </button>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-64 overflow-auto">
            {/* Opção: Todas */}
            <div
              role="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={selectAll}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                selected === null ? "bg-indigo-50" : ""
              }`}
            >
              Todas as categorias
            </div>

            {/* Lista filtrada */}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 text-center">Nenhum resultado</div>
            ) : (
              filtered.map((item, idx) => (
                <div
                  key={item.id + (item.isChild ? "-child" : "-parent")}
                  role="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center ${
                    idx === activeIndex ? "bg-indigo-50" : "hover:bg-gray-50"
                  }`}
                >
                  {item.isChild ? (
                    <>
                      <span className="text-gray-400 mr-1">└─</span>
                      <span className="text-gray-700">{item.name}</span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-800">{item.name}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hint abaixo (opcional) */}
      <p className="text-xs text-gray-500 mt-1">
        Digite para buscar. Use ↑/↓ para navegar e Enter para selecionar.
      </p>
    </div>
  );
};

export default CategorySelector;
