import React, { useEffect, useState } from "react";
import api from "../services/api";
import AccountModal from "../components/accounts/AccountModal";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Pencil, Landmark } from "lucide-react";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get("/accounts");
      setAccounts(response.data);
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    } finally {
      if (initial) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleCreate = async (accountData) => {
    try {
      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, accountData);
      } else {
        await api.post("/accounts", accountData);
      }

      // Comentado temporariamente para teste
      // await fetchAccounts(false);
    } catch (err) {
      console.error("Erro ao salvar conta:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/accounts/${confirmDeleteId}`);
      fetchAccounts();
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
    }
  };

  useEffect(() => {
    fetchAccounts(true);
  }, []);

  const mainAccount = accounts.find((acc) => acc.isMain);
  const otherAccounts = accounts.filter((acc) => !acc.isMain);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);

  const renderAccountCard = (account) => {
    const bankLogo = `/banks/${account.bank.toLowerCase()}.png`;

    return (
      <li
        key={account.id}
        className="bg-white p-4 rounded shadow space-y-2 w-[330px] min-h-[200px] relative transition hover:shadow-md hover:scale-[1.01] duration-200"
      >
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => {
              setEditingAccount(account);
              setIsModalOpen(true);
            }}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setConfirmDeleteId(account.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={bankLogo}
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.src = "/banks/outro.png";
                e.target.dataset.fallback = true;
              }
            }}
            alt={account.bank}
            className="w-10 h-10 object-contain"
          />
          <div>
            <p className="font-bold text-lg">{account.name}</p>
            <p className="text-sm text-gray-600">{account.bank}</p>
            {account.isMain && (
              <span className="inline-block text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1">
                Conta Principal
              </span>
            )}
          </div>
        </div>

        <div className="text-green-600 font-semibold text-xl pt-2">
          {formatCurrency(account.saldoAtual)}
        </div>
      </li>
    );
  };

// if (loading) {
//   return (
//     <div className="flex flex-col items-center justify-center p-6 text-gray-600 text-sm animate-fade-in">
//       <svg
//         className="animate-spin h-6 w-6 text-indigo-600 mb-3"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//       >
//         <circle
//           className="opacity-25"
//           cx="12"
//           cy="12"
//           r="10"
//           stroke="currentColor"
//           strokeWidth="4"
//         />
//         <path
//           className="opacity-75"
//           fill="currentColor"
//           d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 00-10 10h4z"
//         />
//       </svg>
//       <p>Carregando informações das contas... aguarde um instante.</p>
//     </div>
//   );
// }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Landmark className="w-6 h-6 text-blue-600" />
          Contas
        </h2>
        <button
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow font-semibold text-sm"
        >
          <Landmark size={20} />
          Cadastrar Nova Conta
          <PlusCircle size={20} strokeWidth={2.5} />
        </button>
      </div>

      {accounts.length > 0 && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl shadow w-[330px]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm font-medium">Saldo Total em Contas</p>
              <p className="text-lg font-bold">
                {formatCurrency(
                  accounts.reduce(
                    (total, acc) => total + parseFloat(acc.saldoAtual || 0),
                    0
                  )
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {mainAccount && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Conta Principal</h3>
          <ul className="flex flex-wrap gap-4">
            {renderAccountCard(mainAccount)}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Outras Contas</h3>
        <ul className="flex flex-wrap gap-4">
          {otherAccounts.map(renderAccountCard)}
        </ul>
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleCreate}
        editingAccount={editingAccount}
      />

      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded p-6 w-full max-w-sm text-center space-y-4 shadow-lg"
            >
              <Trash2 className="mx-auto text-red-600" size={42} />
              <h3 className="text-lg font-bold">Confirmar exclusão</h3>
              <p className="text-gray-600">
                Deseja realmente excluir esta conta?
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accounts;
