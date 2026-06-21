'use strict';

const db = require('../../models');
const { Op } = require('sequelize');

// ── Lấy danh sách bài viết ──────────────────────────────────────────────────
module.exports.getPosts = async (req, res) => {
  try {
    const currentUserId = req.query.userId || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await db.Post.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'fullName'],
        },
      ],
    });

    // Đính kèm số lượt thích, số bình luận và trạng thái đã thích
    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await db.PostLike.count({ where: { postId: post.id } });
        const commentCount = await db.Comment.count({ where: { postId: post.id } });
        let isLiked = false;
        if (currentUserId) {
          const like = await db.PostLike.findOne({
            where: { postId: post.id, userId: currentUserId },
          });
          isLiked = !!like;
        }
        return {
          ...post.toJSON(),
          likeCount,
          commentCount,
          isLiked,
        };
      })
    );

    return res.status(200).json({ success: true, data: postsWithMeta });
  } catch (error) {
    console.error('[getPosts]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Lấy chi tiết bài viết ────────────────────────────────────────────────────
module.exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.query.userId || null;

    const post = await db.Post.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'fullName'],
        },
        {
          model: db.Comment,
          as: 'comments',
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: db.User,
              as: 'author',
              attributes: ['id', 'fullName'],
            },
          ],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    const likeCount = await db.PostLike.count({ where: { postId: id } });
    let isLiked = false;
    if (currentUserId) {
      const like = await db.PostLike.findOne({ where: { postId: id, userId: currentUserId } });
      isLiked = !!like;
    }

    return res.status(200).json({
      success: true,
      data: { ...post.toJSON(), likeCount, isLiked },
    });
  } catch (error) {
    console.error('[getPostById]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Tạo bài viết mới ─────────────────────────────────────────────────────────
module.exports.createPost = async (req, res) => {
  try {
    const { userId, content, title } = req.body;
    const imageUrl = req.body.imageUrl || null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Cần đăng nhập để đăng bài' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nội dung bài viết không được để trống' });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const post = await db.Post.create({
      userId,
      title: title || null,
      content: content.trim(),
      imageUrl,
    });

    const postWithAuthor = await db.Post.findByPk(post.id, {
      include: [{ model: db.User, as: 'author', attributes: ['id', 'fullName'] }],
    });

    return res.status(201).json({
      success: true,
      data: { ...postWithAuthor.toJSON(), likeCount: 0, commentCount: 0, isLiked: false },
    });
  } catch (error) {
    console.error('[createPost]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Xóa bài viết ─────────────────────────────────────────────────────────────
module.exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await db.Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }
    if (post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này' });
    }

    // Xóa comments và likes liên quan trước
    await db.Comment.destroy({ where: { postId: id } });
    await db.PostLike.destroy({ where: { postId: id } });
    await post.destroy();

    return res.status(200).json({ success: true, message: 'Đã xóa bài viết thành công' });
  } catch (error) {
    console.error('[deletePost]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Thích / bỏ thích bài viết ────────────────────────────────────────────────
module.exports.toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Cần đăng nhập để thích bài viết' });
    }

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    const existingLike = await db.PostLike.findOne({ where: { postId, userId } });

    let isLiked;
    if (existingLike) {
      await existingLike.destroy();
      isLiked = false;
    } else {
      await db.PostLike.create({ postId, userId });
      isLiked = true;
    }

    const likeCount = await db.PostLike.count({ where: { postId } });

    return res.status(200).json({ success: true, data: { isLiked, likeCount } });
  } catch (error) {
    console.error('[toggleLike]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Viết bình luận ───────────────────────────────────────────────────────────
module.exports.createComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { userId, content } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Cần đăng nhập để bình luận' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
    }

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    const comment = await db.Comment.create({
      postId,
      userId,
      content: content.trim(),
    });

    const commentWithAuthor = await db.Comment.findByPk(comment.id, {
      include: [{ model: db.User, as: 'author', attributes: ['id', 'fullName'] }],
    });

    return res.status(201).json({ success: true, data: commentWithAuthor });
  } catch (error) {
    console.error('[createComment]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Xóa bình luận ───────────────────────────────────────────────────────────
module.exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const comment = await db.Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
    }

    await comment.destroy();
    return res.status(200).json({ success: true, message: 'Đã xóa bình luận thành công' });
  } catch (error) {
    console.error('[deleteComment]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Sửa bài viết ─────────────────────────────────────────────────────────────
module.exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;
    const imageUrl = req.body.imageUrl || null;

    if (!userId) return res.status(401).json({ success: false, message: 'Cần đăng nhập' });

    const post = await db.Post.findByPk(id);
    if (!post) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    if (post.userId !== userId) return res.status(403).json({ success: false, message: 'Không có quyền' });

    post.content = content || post.content;
    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }
    await post.save();

    const postWithAuthor = await db.Post.findByPk(post.id, {
      include: [{ model: db.User, as: 'author', attributes: ['id', 'fullName'] }],
    });

    return res.status(200).json({ success: true, data: postWithAuthor });
  } catch (error) {
    console.error('[updatePost]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Sửa bình luận ────────────────────────────────────────────────────────────
module.exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Cần đăng nhập' });

    const comment = await db.Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    if (comment.userId !== userId) return res.status(403).json({ success: false, message: 'Không có quyền' });

    comment.content = content || comment.content;
    await comment.save();

    const commentWithAuthor = await db.Comment.findByPk(comment.id, {
      include: [{ model: db.User, as: 'author', attributes: ['id', 'fullName'] }],
    });

    return res.status(200).json({ success: true, data: commentWithAuthor });
  } catch (error) {
    console.error('[updateComment]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Lấy danh sách bài viết theo User ─────────────────────────────────────────
module.exports.getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.query.currentUserId || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await db.Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: db.User, as: 'author', attributes: ['id', 'fullName'] },
      ],
    });

    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await db.PostLike.count({ where: { postId: post.id } });
        const commentCount = await db.Comment.count({ where: { postId: post.id } });
        let isLiked = false;
        if (currentUserId) {
          const like = await db.PostLike.findOne({
            where: { postId: post.id, userId: currentUserId },
          });
          isLiked = !!like;
        }
        return { ...post.toJSON(), likeCount, commentCount, isLiked };
      })
    );

    return res.status(200).json({ success: true, data: postsWithMeta });
  } catch (error) {
    console.error('[getPostsByUserId]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
