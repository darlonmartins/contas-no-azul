// src/components/dashboard/MonthSelector.jsx
import React from "react";

/**
 * Props:
 * - value: "YYYY-MM"
 * - onChange: (v) => void
 * - className: string (opcional)
 * - hideLabel: boolean (se true, não renderiza o label e usa aria-label)
 * - labelClassName / inputClassName: opcionais p/ ajustes finos
 */
const MonthSelector = ({
  value,
  onChange,
  className = "",
  hideLabel = false,
  labelClassName = "",
  inputClassName = ""
}) => {
  if (hideLabel) {
    return (
      <div className={`flex items-center ${className}`}>
        <input
          type="month"
          aria-label="Mês"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border rounded px-3 h-9 ${inputClassName}`}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
        Mês:
      </label>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded px-3 h-9 ${inputClassName}`}
      />
    </div>
  );
};

export default MonthSelector;
