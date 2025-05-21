import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { CheckCircle2 } from "lucide-react";
import ConfirmUpdateModal from "../ui/ConfirmUpdateModal";

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  return (Number(numeric) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};


const parseAmountToFloat = (formatted) => {
  if (!formatted) return 0;
  return parseFloat(
    formatted.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
};


const TransactionModal = ({ transaction, onClose, onSave, initialType, refresh }) => {
  const isEditing = !!transaction;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(initialType || "despesa_cartao");
  const getLocalToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getLocalToday());

  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [isFixedExpense, setIsFixedExpense] = useState(false); // ✅ Novo estado
  const [showConfirmFixedExpense, setShowConfirmFixedExpense] = useState(false);
  const [isUpdatingFixedExpense, setIsUpdatingFixedExpense] = useState(false);
  const [originalTotalAmount, setOriginalTotalAmount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);





  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");

  const [success, setSuccess] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const selected = categories.find((cat) => parseInt(cat.id) === parseInt(selectedCategoryId));
    if (selected?.children?.length > 0) {
      setSubcategories(selected.children);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, categories]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      }
    };

    const fetchCards = async () => {
      try {
        const res = await api.get("/cards");
        setCards(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar cartões:", err);
      }
    };

    if (["income", "expense", "transfer"].includes(type)) fetchAccounts();
    if (type === "despesa_cartao") fetchCards();
  }, [type]);

  // ✅ Corrige preenchimento automático ao editar
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || "");
      setAmount(transaction.amount ? String(transaction.amount).replace(".", ",") : "");
      setType(transaction.type || initialType || "despesa_cartao");
      setDate(transaction.date ? transaction.date.slice(0, 10) : getLocalToday());
      setIsInstallment(transaction.isInstallment || false);
      setTotalInstallments(transaction.totalInstallments || 1);
      setSelectedCategoryId(transaction.Category?.parentId || transaction.categoryId || "");
      setSelectedSubcategoryId(transaction.categoryId || "");
      setFromAccountId(transaction.fromAccountId || "");
      setToAccountId(transaction.toAccountId || "");
      setCardId(transaction.cardId || "");
    }
  }, [transaction]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    setIsInstallment(false);
    setTotalInstallments(1);
    setFromAccountId("");
    setToAccountId("");
    setCardId("");
    setSuccess(false);
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCurrencyInput(raw);
    setAmount(formatted);

    if (isEditing && isInstallment && transaction.totalInstallments > 1) {
      const valorTotal = parseFloat(transaction.amount) * transaction.totalInstallments;
      setOriginalTotalAmount(valorTotal);
    }
  };
  const convertType = (t) => {
    switch (t) {
      case 'income': return 'ganho';
      case 'expense': return 'despesa';
      case 'transfer': return 'transferencia';
      default: return t; // já está correto (ex: 'despesa', 'despesa_cartao')
    }
  };
  const saveTransaction = async (payload) => {
  try {
    if (isEditing) {
      await api.put(`/transactions/${transaction.id}`, payload);
      toast.success("Transação atualizada com sucesso.");
      if (onSave) onSave();
      if (refresh) refresh();
      onClose();
    } else {
      await api.post("/transactions", {
        ...payload,
        isFixedExpense: isFixedExpense,
      });
      setSuccess(true);
      if (onSave) onSave();
      if (refresh) refresh();
    }
  } catch (err) {
    console.error("Erro ao salvar transação:", err);
    toast.error("Erro ao salvar transação.");
  }
};




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // evita múltiplos envios
    setIsSubmitting(true);

    const categoryId = selectedSubcategoryId || selectedCategoryId;

    const payload = {
      title,
      amount: (() => {
        const editedAmount = parseAmountToFloat(amount);

        if (isEditing && isInstallment && transaction?.totalInstallments > 1) {
          return showConfirmUpdate ? editedAmount * totalInstallments : editedAmount;
        }
        return editedAmount;
      })(),

      type: convertType(type),
      date,
      isInstallment,
      totalInstallments: isInstallment ? totalInstallments : null,
      categoryId: type === "transfer" ? null : categoryId ? parseInt(categoryId) : null,
      fromAccountId:
        ["ganho", "despesa"].includes(convertType(type))
          ? parseInt(fromAccountId)
          : convertType(type) === "transferencia"
            ? parseInt(fromAccountId)
            : null,
      toAccountId: convertType(type) === "transferencia" ? parseInt(toAccountId) : null,
      cardId: convertType(type) === "despesa_cartao" ? parseInt(cardId) : null,
      ...(isEditing && showConfirmUpdate ? { updateAllInstallments: true } : {}),
      ...(isEditing && showConfirmFixedExpense ? { updateFixedExpense: true } : {}),
      ...(!isEditing && isFixedExpense ? { isFixedExpense: true } : {}),
    };

    console.log("📦 Payload enviado para /transactions:", payload);

    if (!payload.title || !payload.type || !payload.amount || !payload.date) {
      console.warn("⚠️ Payload incompleto! Verifique os campos obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    if (isInstallment) {
      const valorTotal = parseAmountToFloat(amount);
      const qtdParcelas = parseInt(totalInstallments);
      const valorParcela = valorTotal / qtdParcelas;

      if (valorTotal < 1) {
        toast.error("Valor mínimo para parcelamento é R$ 1,00.");
        setIsSubmitting(false);
        return;
      }

      if (valorParcela < 0.01) {
        toast.error("O valor de cada parcela não pode ser menor que R$ 0,01.");
        setIsSubmitting(false);
        return;
      }

      if (qtdParcelas > 999) {
        toast.error("Número máximo de parcelas permitido é 999.");
        setIsSubmitting(false);
        return;
      }
    }

    if (isEditing && isInstallment && transaction?.totalInstallments > 1) {
      setPendingPayload(payload);
      setShowConfirmUpdate(true);
      setIsSubmitting(false); // reativa após confirmação
    } else {
      await saveTransaction(payload);
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-lg max-h-[95vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        {success && !isEditing ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <p className="text-green-700 text-lg font-semibold">
              Transação registrada com sucesso.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={resetForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Adicionar outra
              </button>
              <button
                onClick={onClose}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Agora não
              </button>
            </div>
          </div>
       ) : (
  <form onSubmit={handleSubmit} className="space-y-4">
    <h2 className="text-lg font-bold">
      {isEditing
        ? "Editar Transação"
        : type === "income"
          ? "Registrar Ganho"
          : type === "transfer"
            ? "Registrar Transferência"
            : type === "despesa_cartao"
              ? "Registrar Despesa com Cartão"
              : "Registrar Despesa"}
    </h2>

    <div>
      <label className="block text-sm font-medium">Título</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Valor (R$)</label>
      <input
        type="text"
        inputMode="numeric"
        className="w-full border px-3 py-2 rounded"
        value={amount}
        onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
        required
        placeholder="Ex: 500,00"
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Data</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    {type === "transfer" ? (
      <>
        <div>
          <label className="block text-sm font-medium">Conta de Origem</label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Conta de Destino</label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </>
    ) : type === "despesa_cartao" ? (
      <>
        <div>
          <label className="block text-sm font-medium">Cartão</label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium">Subcategoria</label>
            <select
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecione...</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isInstallment}
            onChange={(e) => setIsInstallment(e.target.checked)}
          />
          <span>Parcelado?</span>
        </div>

        {isInstallment && (
          <div>
            <label className="block text-sm font-medium">Total de Parcelas</label>
            <input
              type="number"
              value={totalInstallments}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 3 && parseInt(value) <= 999) {
                  setTotalInstallments(value);
                }
              }}
              className="w-full border px-3 py-2 rounded"
              min={1}
              max={999}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFixedExpense}
            onChange={(e) => setIsFixedExpense(e.target.checked)}
          />
          <span>Despesa fixa (repetir por 12 meses)</span>
        </div>
      </>
    ) : (
      <>
        <div>
          <label className="block text-sm font-medium">Carteira</label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium">Subcategoria</label>
            <select
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecione...</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        {type === "despesa" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFixedExpense}
              onChange={(e) => setIsFixedExpense(e.target.checked)}
            />
            <span>Despesa fixa (repetir por 12 meses)</span>
          </div>
        )}
      </>
    )}

    <div className="flex justify-end gap-2 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 rounded text-white ${
          isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Registrar"}
      </button>
    </div>
  </form>
        )}


        {showConfirmUpdate && (
          <ConfirmUpdateModal
            isOpen={showConfirmUpdate}
            onClose={() => {
              setShowConfirmUpdate(false);
              setPendingPayload(null);
            }}
            onConfirm={async () => {
              if (pendingPayload) {
                await saveTransaction({ ...pendingPayload, updateAllInstallments: true });
              }
              setShowConfirmUpdate(false);
              setPendingPayload(null);
            }}
            onCancel={async () => {
              if (pendingPayload) {
                await saveTransaction({ ...pendingPayload, updateAllInstallments: false });
              }
              setShowConfirmUpdate(false);
              setPendingPayload(null);
            }}
            message="Deseja aplicar esta alteração a todas as parcelas futuras?"
          />
        )}

        {showConfirmFixedExpense && (
          <ConfirmUpdateModal
            isOpen={showConfirmFixedExpense}
            onClose={() => {
              setShowConfirmFixedExpense(false);
              setPendingPayload(null);
            }}
            onConfirm={async () => {
              if (pendingPayload) {
                await saveTransaction({ ...pendingPayload, updateFixedExpense: true });
              }
              setShowConfirmFixedExpense(false);
              setPendingPayload(null);
            }}
            onCancel={async () => {
              if (pendingPayload) {
                await saveTransaction({ ...pendingPayload, updateFixedExpense: false });
              }
              setShowConfirmFixedExpense(false);
              setPendingPayload(null);
            }}
            message="Deseja aplicar esta alteração às despesas fixas futuras?"
          />
        )}



      </div>
    </div>
  );
};

export default TransactionModal;
