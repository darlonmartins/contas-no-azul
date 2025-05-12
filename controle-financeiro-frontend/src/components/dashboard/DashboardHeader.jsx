import React from "react";

const DashboardHeader = () => {
  const currentMonth = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="mb-4">
      <h1 className="text-3xl font-bold">Resumo - {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}</h1>
    </div>
  );
};

export default DashboardHeader;
