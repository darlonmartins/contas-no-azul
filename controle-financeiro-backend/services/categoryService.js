const { Category } = require('../models');

const createDefaultCategories = async (userId) => {
  const defaults = [
    { name: "Moradia", icon: "🏠", subs: ["Aluguel", "Energia", "Água", "Condomínio", "Internet", "Celular", "Outros"] },
    { name: "Alimentação", icon: "🍽️", subs: ["Supermercado", "Restaurantes", "Delivery", "Outros"] },
    { name: "Transporte", icon: "🚗", subs: ["Combustível", "Uber","99", "Ônibus", "Manutenção", "Outros"] },
    { name: "Lazer", icon: "🎮", subs: ["Cinema", "Viagens", "Shows", "Outros"] },
    { name: "Saúde", icon: "🩺", subs: ["Farmácia", "Plano de saúde", "Consultas", "Exames", "Academia", "Outros"] },
    { name: "Vestuário", icon: "👕", subs: ["Roupas", "Calçados", "Acessórios", "Outros"] },
    { name: "Viagem", icon: "✈️", subs: ["Passagens", "Hospedagem", "Passeios", "Outros"] },
    { name: "Eletrônicos", icon: "💻", subs: ["Celulares", "Computadores", "Gadgets", "Outros"] },
    { name: "Educação", icon: "📚", subs: ["Cursos", "Faculdade", "Material escolar", "Outros"] },
    { name: "Dívidas Fixas", icon: "📆", subs: ["Financiamento", "Cartão", "Empréstimo", "Outros"] },
    { name: "Capitalização", icon: "💰", subs: ["Investimentos", "Previdência", "Outros"] },
    { name: "Caixa", icon: "🧾", subs: ["Troco", "Dinheiro físico", "Outros"] },
    { name: "Salário", icon: "💵", subs: ["CLT", "Freelance", "Comissões", "Outros"] },
    { name: "Assinaturas", icon: "📺", subs: ["Spotify", "Netflix", "Prime", "HBO", "Outros"] },
    { name: "Beleza", icon: "💇", subs: ["Perfumes", "Barbearia", "Salão", "Outros"] },
    { name: "Pet", icon: "🐶", subs: ["Ração", "Petiscos", "Veterinário", "Plano de Saúde", "Vacinas", "Banho e Tosa", "Medicamentos", "Acessórios", "Brinquedos", "Creche / Hotel", "Outros"] },
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
