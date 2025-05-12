import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Landmark } from "lucide-react";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts");
      setAccounts(response.data);
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border"
        >
          <div className="flex items-center gap-2 text-gray-700">
            <Landmark className="w-5 h-5" />
            <span className="font-semibold text-lg">{account.name}</span>
          </div>
          <div className="text-sm text-gray-500">{account.bank}</div>
          <div className="text-sm text-gray-500">
            Tipo:{" "}
            <span className="capitalize">{account.type.replace("_", " ")}</span>
          </div>
          <div className="text-green-600 font-bold text-lg mt-2">
            {formatCurrency(account.saldoAtual || 0)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountList;
