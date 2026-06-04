const { Category, LibraryPlant } = require('../../models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ data: categories });
  } catch (error) {
    console.error('getAllCategories error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check duplicate name
    const existing = await Category.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ message: 'Tên danh mục này đã tồn tại!' });
    }

    const newCategory = await Category.create({ name: name.trim() });
    return res.status(201).json({ message: 'Tạo danh mục thành công', data: newCategory });
  } catch (error) {
    console.error('createCategory error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check duplicate name
    const existing = await Category.findOne({ where: { name: name.trim() } });
    if (existing && existing.id !== id) {
      return res.status(400).json({ message: 'Tên danh mục này đã tồn tại!' });
    }

    await category.update({ name: name.trim() });
    return res.status(200).json({ message: 'Cập nhật danh mục thành công', data: category });
  } catch (error) {
    console.error('updateCategory error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if any plants are using this category
    const plantCount = await LibraryPlant.count({
      where: { category: category.name }
    });

    if (plantCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục "${category.name}" vì hiện có ${plantCount} cây đang sử dụng danh mục này. Vui lòng chuyển các cây sang danh mục khác trước khi xóa.`
      });
    }

    await category.destroy();
    return res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

