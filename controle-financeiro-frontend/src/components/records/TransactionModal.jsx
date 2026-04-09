import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { CheckCircle2, X } from "lucide-react";
import ConfirmUpdateModal from "../ui/ConfirmUpdateModal";

const formatCurrencyInput = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  return (Number(numeric) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const parseAmountToFloat = (formatted) => {
  if (!formatted) return 0;
  return parseFloat(formatted.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
};

const typeConfig = {
  income:         { label: "Registrar Ganho",              color: "#16a34a", bg: "#f0fdf4" },
  expense:        { label: "Registrar Despesa",            color: "#dc2626", bg: "#fef2f2" },
  despesa_cartao: { label: "Registrar Despesa com Cartão", color: "#7c3aed", bg: "#f5f3ff" },
  transfer:       { label: "Registrar Transferência",      color: "#2563eb", bg: "#eff6ff" },
  ganho:          { label: "Registrar Ganho",              color: "#16a34a", bg: "#f0fdf4" },
  despesa:        { label: "Registrar Despesa",            color: "#dc2626", bg: "#fef2f2" },
  transferencia:  { label: "Registrar Transferência",      color: "#2563eb", bg: "#eff6ff" },
};

const TransactionModal = ({ transaction, onClose, onSave, initialType, refresh }) => {
  const isEditing = !!transaction;

  const getLocalToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
  };

  const [title, setTitle]                             = useState("");
  const [amount, setAmount]                           = useState("");
  const [type, setType]                               = useState(initialType || "despesa_cartao");
  const [date, setDate]                               = useState(getLocalToday());
  const [isInstallment, setIsInstallment]             = useState(false);
  const [totalInstallments, setTotalInstallments]     = useState(1);
  const [showConfirmUpdate, setShowConfirmUpdate]     = useState(false);
  const [pendingPayload, setPendingPayload]           = useState(null);
  const [isFixedExpense, setIsFixedExpense]           = useState(false);
  const [showConfirmFixedExpense, setShowConfirmFixedExpense] = useState(false);
  const [originalTotalAmount, setOriginalTotalAmount] = useState(null);
  const [isSubmitting, setIsSubmitting]               = useState(false);
  const [categories, setCategories]                   = useState([]);
  const [selectedCategoryId, setSelectedCategoryId]   = useState("");
  const [subcategories, setSubcategories]             = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [accounts, setAccounts]                       = useState([]);
  const [fromAccountId, setFromAccountId]             = useState("");
  const [toAccountId, setToAccountId]                 = useState("");
  const [cards, setCards]                             = useState([]);
  const [cardId, setCardId]                           = useState("");
  const [success, setSuccess]                         = useState(false);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const selected = categories.find(cat => parseInt(cat.id) === parseInt(selectedCategoryId));
    setSubcategories(selected?.children?.length > 0 ? selected.children : []);
  }, [selectedCategoryId, categories]);

  useEffect(() => {
    if (["income", "expense", "transfer"].includes(type)) {
      api.get("/accounts").then(r => setAccounts(r.data || [])).catch(() => {});
    }
    if (type === "despesa_cartao") {
      api.get("/cards").then(r => setCards(r.data || [])).catch(() => {});
    }
  }, [type]);

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
    setTitle(""); setAmount(""); setDate(getLocalToday());
    setSelectedCategoryId(""); setSelectedSubcategoryId("");
    setIsInstallment(false); setTotalInstallments(1);
    setFromAccountId(""); setToAccountId(""); setCardId("");
    setSuccess(false);
  };

  const convertType = (t) => {
    switch (t) {
      case "income": return "ganho";
      case "expense": return "despesa";
      case "transfer": return "transferencia";
      default: return t;
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
        await api.post("/transactions", { ...payload, isFixedExpense });
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    const categoryId = selectedSubcategoryId || selectedCategoryId;
    const convertedType = convertType(type);

    const payload = {
      title,
      amount: (() => {
        const editedAmount = parseAmountToFloat(amount);
        if (isEditing && isInstallment && transaction?.totalInstallments > 1) {
          return showConfirmUpdate ? editedAmount * totalInstallments : editedAmount;
        }
        return editedAmount;
      })(),
      type: convertedType,
      date,
      isInstallment,
      totalInstallments: isInstallment ? totalInstallments : null,
      categoryId: type === "transfer" ? null : categoryId ? parseInt(categoryId) : null,
      fromAccountId: ["ganho", "despesa"].includes(convertedType) || convertedType === "transferencia"
        ? parseInt(fromAccountId) : null,
      toAccountId: convertedType === "transferencia" ? parseInt(toAccountId) : null,
      cardId: convertedType === "despesa_cartao" ? parseInt(cardId) : null,
      ...(isEditing && showConfirmUpdate ? { updateAllInstallments: true } : {}),
      ...(isEditing && showConfirmFixedExpense ? { updateFixedExpense: true } : {}),
      ...(!isEditing && isFixedExpense ? { isFixedExpense: true } : {}),
    };

    if (!payload.title || !payload.type || !payload.amount || !payload.date) {
      toast.warn("Preencha todos os campos obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    if (isInstallment) {
      const valorTotal = parseAmountToFloat(amount);
      const qtd = parseInt(totalInstallments);
      if (valorTotal < 1) { toast.error("Valor mínimo para parcelamento é R$ 1,00."); setIsSubmitting(false); return; }
      if (valorTotal / qtd < 0.01) { toast.error("Valor de cada parcela não pode ser menor que R$ 0,01."); setIsSubmitting(false); return; }
      if (qtd > 999) { toast.error("Número máximo de parcelas é 999."); setIsSubmitting(false); return; }
    }

    if (isEditing && isInstallment && transaction?.totalInstallments > 1) {
      setPendingPayload(payload);
      setShowConfirmUpdate(true);
      setIsSubmitting(false);
    } else {
      await saveTransaction(payload);
      setIsSubmitting(false);
    }
  };

  const cfg = typeConfig[type] || typeConfig.expense;
  const modalTitle = isEditing ? "Editar Transação" : cfg.label;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .tm-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
          font-family: 'DM Sans', sans-serif;
        }
        .tm-modal {
          background: #fff; border-radius: 18px;
          width: 95%; max-width: 500px; max-height: 92vh;
          overflow-y: auto; position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .tm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 0;
        }
        .tm-title { font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px; }
        .tm-close {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: #f1f5f9; cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: #64748b; transition: background 0.15s;
        }
        .tm-close:hover { background: #e2e8f0; color: #0f172a; }
        .tm-accent { height: 3px; border-radius: 999px; margin: 14px 24px 0; }
        .tm-body { padding: 20px 24px 24px; }
        .tm-field { margin-bottom: 14px; }
        .tm-field label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; letter-spacing: 0.2px; text-transform: uppercase; }
        .tm-input, .tm-select {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e2e8f0; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a;
          background: #fff; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .tm-input:focus, .tm-select:focus {
          border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .tm-input::placeholder { color: #94a3b8; }
        .tm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .tm-check-wrap {
          display: flex; align-items: center; gap: 8px; padding: 10px 0;
          cursor: pointer; font-size: 13px; color: #374151; font-weight: 500;
        }
        .tm-check-wrap input[type=checkbox] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
        .tm-divider { height: 1px; background: #f1f5f9; margin: 4px 0 14px; }
        .tm-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; }
        .tm-btn-cancel {
          padding: 10px 20px; border-radius: 9px; border: 1.5px solid #e2e8f0;
          background: #fff; color: #374151; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .tm-btn-cancel:hover { background: #f8fafc; }
        .tm-btn-submit {
          padding: 10px 24px; border-radius: 9px; border: none;
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .tm-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .tm-success {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 24px; text-align: center; gap: 12px;
        }
        .tm-success-icon { width: 56px; height: 56px; border-radius: 16px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; }
        .tm-success h3 { font-size: 17px; font-weight: 600; color: #0f172a; margin: 0; }
        .tm-success p { font-size: 14px; color: #64748b; margin: 0; }
        .tm-success-actions { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
      `}</style>

      <div className="tm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="tm-modal">
          <div className="tm-header">
            <span className="tm-title">{modalTitle}</span>
            <button className="tm-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="tm-accent" style={{ background: cfg.color }} />

          <div className="tm-body">
            {success && !isEditing ? (
              <div className="tm-success">
                <div className="tm-success-icon">
                  <CheckCircle2 size={28} color="#16a34a" />
                </div>
                <h3>Registrado com sucesso!</h3>
                <p>{cfg.label.replace("Registrar", "")} adicionada.</p>
                <div className="tm-success-actions">
                  <button
                    className="tm-btn-submit"
                    style={{ background: cfg.color }}
                    onClick={resetForm}
                  >
                    Adicionar outro
                  </button>
                  <button className="tm-btn-cancel" onClick={onClose}>Fechar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Título */}
                <div className="tm-field">
                  <label>Título</label>
                  <input className="tm-input" type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Salário, Mercado..." />
                </div>

                {/* Valor + Data */}
                <div className="tm-row">
                  <div className="tm-field">
                    <label>Valor (R$)</label>
                    <input
                      className="tm-input" type="text" inputMode="numeric"
                      value={amount}
                      onChange={e => {
                        setAmount(formatCurrencyInput(e.target.value));
                        if (isEditing && isInstallment && transaction?.totalInstallments > 1) {
                          setOriginalTotalAmount(parseFloat(transaction.amount) * transaction.totalInstallments);
                        }
                      }}
                      required placeholder="R$ 0,00"
                    />
                  </div>
                  <div className="tm-field">
                    <label>Data</label>
                    <input className="tm-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                </div>

                <div className="tm-divider" />

                {/* Campos por tipo */}
                {type === "transfer" ? (
                  <div className="tm-row">
                    <div className="tm-field">
                      <label>Conta de origem</label>
                      <select className="tm-select" value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                    <div className="tm-field">
                      <label>Conta de destino</label>
                      <select className="tm-select" value={toAccountId} onChange={e => setToAccountId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                  </div>
                ) : type === "despesa_cartao" ? (
                  <>
                    <div className="tm-field">
                      <label>Cartão</label>
                      <select className="tm-select" value={cardId} onChange={e => setCardId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="tm-row">
                      <div className="tm-field">
                        <label>Categoria</label>
                        <select className="tm-select" value={selectedCategoryId} onChange={e => setSelectedCategoryId(parseInt(e.target.value))}>
                          <option value="">Selecione...</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      {subcategories.length > 0 && (
                        <div className="tm-field">
                          <label>Subcategoria</label>
                          <select className="tm-select" value={selectedSubcategoryId} onChange={e => setSelectedSubcategoryId(parseInt(e.target.value))}>
                            <option value="">Selecione...</option>
                            {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <label className="tm-check-wrap">
                      <input type="checkbox" checked={isInstallment} onChange={e => setIsInstallment(e.target.checked)} />
                      Parcelado?
                    </label>
                    {isInstallment && (
                      <div className="tm-field">
                        <label>Total de parcelas</label>
                        <input className="tm-input" type="number" value={totalInstallments}
                          onChange={e => { if (e.target.value.length <= 3 && parseInt(e.target.value) <= 999) setTotalInstallments(e.target.value); }}
                          min={1} max={999} />
                      </div>
                    )}
                    <label className="tm-check-wrap">
                      <input type="checkbox" checked={isFixedExpense} onChange={e => setIsFixedExpense(e.target.checked)} />
                      Despesa fixa (repetir por 12 meses)
                    </label>
                  </>
                ) : (
                  <>
                    <div className="tm-field">
                      <label>Conta</label>
                      <select className="tm-select" value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                    <div className="tm-row">
                      <div className="tm-field">
                        <label>Categoria</label>
                        <select className="tm-select" value={selectedCategoryId} onChange={e => setSelectedCategoryId(parseInt(e.target.value))}>
                          <option value="">Selecione...</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      {subcategories.length > 0 && (
                        <div className="tm-field">
                          <label>Subcategoria</label>
                          <select className="tm-select" value={selectedSubcategoryId} onChange={e => setSelectedSubcategoryId(parseInt(e.target.value))}>
                            <option value="">Selecione...</option>
                            {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {(type === "expense" || type === "despesa") && (
                      <label className="tm-check-wrap">
                        <input type="checkbox" checked={isFixedExpense} onChange={e => setIsFixedExpense(e.target.checked)} />
                        Despesa fixa (repetir por 12 meses)
                      </label>
                    )}
                  </>
                )}

                <div className="tm-divider" />

                <div className="tm-actions">
                  <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancelar</button>
                  <button
                    type="submit"
                    className="tm-btn-submit"
                    style={{ background: cfg.color }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Registrar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showConfirmUpdate && (
        <ConfirmUpdateModal
          isOpen={showConfirmUpdate}
          onClose={() => { setShowConfirmUpdate(false); setPendingPayload(null); }}
          onConfirm={async () => { if (pendingPayload) await saveTransaction({ ...pendingPayload, updateAllInstallments: true }); setShowConfirmUpdate(false); setPendingPayload(null); }}
          onCancel={async () => { if (pendingPayload) await saveTransaction({ ...pendingPayload, updateAllInstallments: false }); setShowConfirmUpdate(false); setPendingPayload(null); }}
          message="Deseja aplicar esta alteração a todas as parcelas futuras?"
        />
      )}

      {showConfirmFixedExpense && (
        <ConfirmUpdateModal
          isOpen={showConfirmFixedExpense}
          onClose={() => { setShowConfirmFixedExpense(false); setPendingPayload(null); }}
          onConfirm={async () => { if (pendingPayload) await saveTransaction({ ...pendingPayload, updateFixedExpense: true }); setShowConfirmFixedExpense(false); setPendingPayload(null); }}
          onCancel={async () => { if (pendingPayload) await saveTransaction({ ...pendingPayload, updateFixedExpense: false }); setShowConfirmFixedExpense(false); setPendingPayload(null); }}
          message="Deseja aplicar esta alteração às despesas fixas futuras?"
        />
      )}
    </>
  );
};

export default TransactionModal;
