import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

const bankOptions = [
  { name: "Carteira", value: "carteira" },
  { name: "Banco do Brasil", value: "banco-do-brasil" },
  { name: "Caixa Econômica", value: "caixa" },
  { name: "Bradesco", value: "bradesco" },
  { name: "Itaú", value: "itau" },
  { name: "Santander", value: "santander" },
  { name: "Nubank", value: "nubank" },
  { name: "Inter", value: "inter" },
  { name: "PicPay", value: "picpay" },
  { name: "C6 Bank", value: "c6-bank" },
  { name: "Outro", value: "outro" },
];

const AccountModal = ({ isOpen, onClose, onSubmit, editingAccount }) => {
  const [form, setForm] = useState({
    name: "",
    bank: "",
    type: "corrente",
    isMain: false,
    saldoAtual: "",
  });

  const [success, setSuccess] = useState(false);
  const [showBanks, setShowBanks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || success) return;

    if (editingAccount) {
      setForm({
        name: editingAccount.name || "",
        bank: editingAccount.bank || "",
        type: editingAccount.type || "corrente",
        isMain: editingAccount.isMain || false,
        saldoAtual: editingAccount.saldoAtual?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) || "",
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [editingAccount, isOpen, success]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "saldoAtual") {
      const raw = value.replace(/\D/g, "");
      const formatted = (Number(raw) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      setForm((prev) => ({ ...prev, saldoAtual: formatted }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bank || !form.type) {
      alert("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    setLoading(true);

    const saldo = parseFloat(
      form.saldoAtual.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
    );

    const payload = {
      ...form,
      saldoAtual: saldo,
    };

    try {
      await onSubmit(payload);
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      alert("Erro ao cadastrar conta.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      bank: "",
      type: "corrente",
      isMain: false,
      saldoAtual: "",
    });
    setSuccess(false);
    setIsEditing(false);
  };

  const getBankLogo = (bankValue) => `/banks/${bankValue}.png`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-md shadow-xl w-full max-w-md relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            {!success ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  {editingAccount ? "Editar Conta" : "Adicionar Conta"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Nome da Conta</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Banco</label>
                    <div className="border rounded px-3 py-2 w-full bg-white relative">
                      <button
                        type="button"
                        className="w-full text-left flex items-center justify-between"
                        onClick={() => setShowBanks((prev) => !prev)}
                      >
                        {form.bank ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={getBankLogo(form.bank)}
                              alt={`Logo ${form.bank}`}
                              className="h-5 w-5"
                            />
                            <span>{bankOptions.find((b) => b.value === form.bank)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Selecione um banco</span>
                        )}
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            showBanks ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showBanks && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border rounded mt-2 max-h-60 overflow-y-auto shadow">
                          {bankOptions.map((b) => (
                            <li
                              key={b.value}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, bank: b.value }));
                                setShowBanks(false);
                              }}
                            >
                              <img
                                src={getBankLogo(b.value)}
                                alt={`Logo ${b.name}`}
                                className="h-5 w-5"
                              />
                              <span>{b.name}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Tipo de Conta</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="principal">Carteira</option>
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupança">Poupança</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Saldo Atual (R$)</label>
                    <input
                      type="text"
                      name="saldoAtual"
                      value={form.saldoAtual}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      inputMode="numeric"
                      placeholder="Ex: R$ 1.000,00"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isMain"
                      checked={form.isMain}
                      onChange={handleChange}
                      id="isMain"
                    />
                    <label htmlFor="isMain" className="text-sm">
                      Conta Principal
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${
                      loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                    } text-white py-2 rounded font-medium mt-2`}
                  >
                    {loading
                      ? "Salvando..."
                      : editingAccount
                      ? "Atualizar Conta"
                      : "Adicionar Conta"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <CheckCircle className="text-green-600 mx-auto" size={48} />
                <h3 className="text-xl font-bold">
                  {isEditing
                    ? "Conta atualizada com sucesso."
                    : "Conta cadastrada com sucesso."}
                </h3>
                <div className="space-y-2">
                  {!isEditing && (
                    <button
                      onClick={resetForm}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium"
                    >
                      Adicionar outra conta
                    </button>
                  )}
                  <button
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="w-full border border-green-600 text-green-600 py-2 rounded font-medium hover:bg-green-50"
                  >
                    {isEditing ? "Fechar" : "Agora não"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;
