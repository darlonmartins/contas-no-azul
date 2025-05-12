import React from "react";

const MonthSelector = ({ value, onChange, className = "" }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700">Mês:</label>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 h-10"
      />
    </div>
  );
};

export default MonthSelector;
