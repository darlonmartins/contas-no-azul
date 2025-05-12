const SummaryCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="text-lg font-semibold">Total de Despesas</h3>
          <p className="text-red-500 text-xl font-bold">R$ 1.250,00</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="text-lg font-semibold">Metas Atingidas</h3>
          <p className="text-green-500 text-xl font-bold">3 de 5</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="text-lg font-semibold">Gastos com Cartões</h3>
          <p className="text-blue-500 text-xl font-bold">R$ 950,00</p>
        </div>
      </div>
    );
  };
  
  export default SummaryCards;
  