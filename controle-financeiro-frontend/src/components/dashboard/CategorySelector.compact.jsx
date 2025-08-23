import React, { useMemo, useState, useRef, useEffect } from "react";

/**
 * CategorySelector (compact)
 * - 1 linha, 36px de altura, com busca.
 * - Retorna "" (todas) OU { id, name } no onChange.
 * - Recebe categories: [{ id, name, children?: [{id,name}] }]
 */
const CategorySelectorCompact = ({ value, onChange, categories = [] }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const selected = typeof value === "object" && value ? value : null;

  const flat = useMemo(() => {
    const arr = [];
    for (const c of categories) {
      arr.push({ id: String(c.id), name: c.name, isChild: false });
      (c.children || []).forEach((s) =>
        arr.push({ id: String(s.id), name: s.name, isChild: true })
      );
    }
    return arr;
  }, [categories]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return flat;
    return flat.filter((i) => i.name.toLowerCase().includes(k));
  }, [flat, q]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="h-9 px-3 border rounded text-sm flex items-center gap-2 hover:bg-gray-50"
        title={selected ? selected.name : "Todas as categorias"}
      >
        <span className="truncate max-w-[160px]">
          {selected ? selected.name : "Todas as categorias"}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-[260px] bg-white border rounded shadow">
          <div className="p-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full h-8 px-2 border rounded text-sm"
            />
          </div>

          <div
            className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50"
            onClick={() => {
              onChange("");
              setQ("");
              setOpen(false);
            }}
          >
            Todas as categorias
          </div>

          <div className="max-h-60 overflow-auto">
            {filtered.map((i) => (
              <div
                key={i.id + (i.isChild ? "-c" : "-p")}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center"
                onClick={() => {
                  onChange({ id: Number(i.id), name: i.name });
                  setQ("");
                  setOpen(false);
                }}
              >
                {i.isChild ? (
                  <>
                    <span className="text-gray-400 mr-1">└─</span>
                    <span>{i.name}</span>
                  </>
                ) : (
                  <span className="font-medium">{i.name}</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                Nenhum resultado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelectorCompact;
