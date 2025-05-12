import React from 'react';

const CategorySelector = ({ value, onChange, categories, className = "" }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700">Categoria:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 h-10"
      >
        <option value="">Todas as categorias</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelector;
