const { Category } = require('../models');

const createDefaultCategories = async (userId) => {
  const defaults = [
    { name: "Moradia", icon: "🏠", subs: ["Aluguel", "Energia", "Água", "Condomínio"] },
    { name: "Alimentação", icon: "🍽️", subs: ["Supermercado", "Restaurantes", "Delivery"] },
    { name: "Transporte", icon: "🚗", subs: ["Combustível", "Uber", "Ônibus", "Manutenção"] },
    { name: "Lazer", icon: "🎮", subs: ["Cinema", "Viagens", "Shows"] },
    { name: "Saúde", icon: "🩺", subs: ["Farmácia", "Plano de saúde", "Consultas", "Exames"] },
    { name: "Vestuário", icon: "👕", subs: ["Roupas", "Calçados", "Acessórios"] },
    { name: "Viagem", icon: "✈️", subs: ["Passagens", "Hospedagem", "Passeios"] },
    { name: "Eletrônicos", icon: "💻", subs: ["Celulares", "Computadores", "Gadgets"] },
    { name: "Educação", icon: "📚", subs: ["Cursos", "Faculdade", "Material escolar"] },
    { name: "Dívidas Fixas", icon: "📆", subs: ["Financiamento", "Cartão", "Empréstimo"] },
    { name: "Capitalização", icon: "💰", subs: ["Investimentos", "Previdência"] },
    { name: "Caixa", icon: "🧾", subs: ["Troco", "Dinheiro físico"] },
    { name: "Salário", icon: "💵", subs: ["CLT", "Freelance", "Comissões"] }
  ];

  for (const item of defaults) {
    const parent = await Category.create({
      name: item.name,
      icon: item.icon,
      userId,
      parentId: null,
    });

    for (const sub of item.subs) {
      await Category.create({
        name: sub,
        icon: item.icon,
        userId,
        parentId: parent.id,
      });
    }
  }
};

module.exports = { createDefaultCategories };
