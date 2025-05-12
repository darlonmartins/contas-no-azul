const { Category, sequelize } = require("../models");
const { Op } = require("sequelize");

const categoryController = {
  // 🔄 Listar categorias com subcategorias agrupadas
  async getAll(req, res) {
    try {
      const categories = await Category.findAll({
        where: { userId: req.user.id, parentId: null },
        include: {
          model: Category,
          as: "children",
        },
        order: [["name", "ASC"]],
      });

      res.json(categories);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  },

  // ➕ Criar categoria principal com subcategorias
  async create(req, res) {
    try {
      const { name, icon, subcategories } = req.body;

      const category = await Category.create({
        name,
        icon,
        parentId: null,
        userId: req.user.id,
      });

      if (Array.isArray(subcategories)) {
        for (const sub of subcategories) {
          await Category.create({
            name: sub,
            icon: null,
            parentId: category.id,
            userId: req.user.id,
          });
        }
      }

      res.status(201).json({ message: "Categoria criada com sucesso" });
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      res.status(500).json({ error: "Erro ao criar categoria" });
    }
  },

  // ✏️ Editar categoria principal e subcategorias
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, icon, subcategories } = req.body;

      const category = await Category.findByPk(id);
      if (!category || category.userId !== req.user.id) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      await category.update({ name, icon });

      // Apagar subcategorias antigas
      await Category.destroy({ where: { parentId: id } });

      // Criar novas subcategorias
      if (Array.isArray(subcategories)) {
        for (const sub of subcategories) {
          await Category.create({
            name: sub,
            parentId: id,
            userId: req.user.id,
          });
        }
      }

      res.json({ message: "Categoria atualizada com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
      res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  },

  // 🎨 Buscar todos os ícones únicos usados nas categorias do usuário
  async getUniqueIcons(req, res) {
    try {
      const icons = await Category.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('icon')), 'icon']
        ],
        where: {
          userId: req.user.id,
          icon: { [Op.ne]: null }
        },
        order: [['icon', 'ASC']]
      });

      const iconList = icons.map(item => item.icon).filter(Boolean);

      res.json(iconList);
    } catch (err) {
      console.error("Erro ao buscar ícones:", err);
      res.status(500).json({ error: "Erro ao buscar ícones das categorias" });
    }
  },

  // ❌ Excluir categoria principal e suas subcategorias
  async delete(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findOne({
        where: { id, userId: req.user.id }
      });

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      // Exclui subcategorias vinculadas
      await Category.destroy({ where: { parentId: id } });

      // Exclui categoria principal
      await category.destroy();

      res.json({ message: "Categoria excluída com sucesso" });
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      res.status(500).json({ error: "Erro ao excluir categoria" });
    }
  },
};

module.exports = categoryController;
