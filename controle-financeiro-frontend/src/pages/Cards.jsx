import React, { useEffect, useState } from "react";
import api from "../services/api";
import CardModal from "../components/cards/CardModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import visa from "../assets/visa.png";
import mastercard from "../assets/mastercard.png";
import elo from "../assets/elo.png";
import hipercard from "../assets/hipercard.png";
import amex from "../assets/amex.png";
import outro from "../assets/outro.png";

const brandLogos = {
  visa,
  mastercard,
  elo,
  hipercard,
  amex,
  outro,
};


const Cards = () => {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

 const fetchCards = async () => {
  try {
    setLoading(true);
    const response = await api.get("/cards/with-available-limit");
    setCards(response.data);
  } catch (err) {
    console.error("Erro ao carregar cartões:", err);
  } finally {
    setLoading(false);
  }
};


  const handleCreate = async (cardData) => {
    try {
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, cardData);
        toast.success("Cartão atualizado com sucesso!");
      } else {
        await api.post("/cards", cardData);
        toast.success("Cartão cadastrado com sucesso!");
      }
      fetchCards();
      setEditingCard(null);
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
      toast.error("Erro ao salvar cartão");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/cards/${confirmDeleteId}`);
      toast.success("Cartão excluído com sucesso");
      fetchCards();
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Erro ao excluir cartão:", err);
      toast.error("Erro ao excluir cartão");
    }
  };

  const handleCardClick = (id) => {
    navigate(`/cards/${id}`);
  };

  const getBarColor = (percent) => {
    if (percent <= 50) return "bg-green-500";
    if (percent <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDaysUntilDue = (dueDay) => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDay);
    if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} className="text-blue-600" />
          Cartões
        </h2>

        {/* ✅ Exibe o botão apenas se houver cartões */}
        {cards.length > 0 && (
          <button
            onClick={() => {
              setEditingCard(null);
              setIsModalOpen(false);
              setTimeout(() => setIsModalOpen(true), 50);
            }}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow font-semibold text-sm transition"
          >
            <CreditCard size={20} />
            Cadastrar Novo Cartão
            <PlusCircle size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Meus Cartões</h3>

        {cards.length === 0 ? (
          <div className="text-center text-gray-600 py-12 flex flex-col items-center">
            <CreditCard size={48} className="text-blue-500 mb-4" />
            <p className="text-xl font-semibold">Nenhum cartão cadastrado</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Você ainda não adicionou nenhum cartão. Clique no botão abaixo para cadastrar.
            </p>
            <button
              onClick={() => {
                setEditingCard(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              Adicionar Cartão
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {cards
              .sort((a, b) => a.dueDate - b.dueDate)
              .map((card) => {
                const usedPercent = Math.min(
                  100,
                  ((card.limit - card.availableLimit) / card.limit) * 100
                );
                const daysUntilDue = getDaysUntilDue(card.dueDate);
                const brandKey = card.brand?.toLowerCase();
                const logoSrc = brandLogos[brandKey] || null;

                return (
                  <li
                    key={card.id}
                    className="bg-white p-4 rounded shadow space-y-2 cursor-pointer hover:ring-2 hover:ring-blue-500 transition relative"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCard(card);
                          setIsModalOpen(true);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(card.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="font-bold text-lg">{card.name}</p>
                    {logoSrc && (
                      <div className="flex justify-end">
                        <img
                          src={logoSrc}
                          alt={card.brand}
                          className="h-6"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    <p className="text-sm text-gray-600">
                      Limite: {Number(card.limit).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Disponível:{" "}
                      {Number(card.availableLimit).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                      <div
                        className={`${getBarColor(usedPercent)} h-full transition-all`}
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      Uso: {usedPercent.toFixed(0)}%
                    </p>

                    <p className="text-sm text-gray-600">
                      Vencimento: dia {card.dueDate}
                      {daysUntilDue <= 5 && (
                        <span className="text-red-500 font-semibold ml-2">
                          (Venc. em {daysUntilDue} dias)
                        </span>
                      )}
                    </p>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={handleCreate}
        editingCard={editingCard}
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
                Deseja realmente excluir este cartão?
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

if (loading) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-gray-600 text-sm animate-fade-in">
      <svg className="animate-spin h-6 w-6 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 00-10 10h4z" />
      </svg>
      <p>Carregando informações dos cartões... aguarde um instante.</p>
    </div>
  );
}



export default Cards;
