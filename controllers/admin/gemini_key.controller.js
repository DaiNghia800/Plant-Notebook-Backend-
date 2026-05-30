'use strict';

const { GeminiKey } = require('../../models');
const geminiScannerService = require('../../services/client/gemini_scanner.service');

// 1. Get all API keys
exports.getAllKeys = async (req, res) => {
  try {
    const keys = await GeminiKey.findAll({
      order: [['id', 'ASC']]
    });
    return res.status(200).json({ data: keys });
  } catch (error) {
    console.error('getAllKeys error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// 2. Add a new API key
exports.createKey = async (req, res) => {
  try {
    const { apiKey, isActive, dailyRequestLimit } = req.body;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({ message: 'apiKey là bắt buộc' });
    }

    const existing = await GeminiKey.findOne({ where: { apiKey: apiKey.trim() } });
    if (existing) {
      return res.status(400).json({ message: 'API Key này đã tồn tại trong hệ thống' });
    }

    const newKey = await GeminiKey.create({
      apiKey: apiKey.trim(),
      isActive: isActive !== undefined ? isActive : true,
      dailyRequestLimit: dailyRequestLimit || 1500
    });

    return res.status(201).json({ message: 'Thêm API Key thành công', data: newKey });
  } catch (error) {
    console.error('createKey error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// 3. Update an existing API key
exports.updateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey, isActive, isBanned, dailyRequestLimit, cooldownUntil } = req.body;

    const keyRecord = await GeminiKey.findByPk(id);
    if (!keyRecord) {
      return res.status(404).json({ message: 'Không tìm thấy API Key' });
    }

    const updates = {};
    if (apiKey !== undefined) updates.apiKey = apiKey.trim();
    if (isActive !== undefined) updates.isActive = isActive;
    if (isBanned !== undefined) updates.isBanned = isBanned;
    if (dailyRequestLimit !== undefined) updates.dailyRequestLimit = dailyRequestLimit;
    if (cooldownUntil !== undefined) updates.cooldownUntil = cooldownUntil;

    await keyRecord.update(updates);

    return res.status(200).json({ message: 'Cập nhật API Key thành công', data: keyRecord });
  } catch (error) {
    console.error('updateKey error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// 4. Delete an API key
exports.deleteKey = async (req, res) => {
  try {
    const { id } = req.params;
    const keyRecord = await GeminiKey.findByPk(id);
    if (!keyRecord) {
      return res.status(404).json({ message: 'Không tìm thấy API Key' });
    }

    await keyRecord.destroy();
    return res.status(200).json({ message: 'Xóa API Key thành công' });
  } catch (error) {
    console.error('deleteKey error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// 5. Run health check / ping on a key
exports.pingKey = async (req, res) => {
  try {
    const { id } = req.params;
    const keyRecord = await GeminiKey.findByPk(id);
    if (!keyRecord) {
      return res.status(404).json({ message: 'Không tìm thấy API Key' });
    }

    try {
      await geminiScannerService.pingKey(keyRecord.apiKey);
      
      // Ping succeeded: Key is active and not banned
      await keyRecord.update({
        isBanned: false,
        cooldownUntil: null
      });

      return res.status(200).json({
        message: 'API Key hoạt động bình thường',
        data: keyRecord
      });
    } catch (pingErr) {
      console.warn(`Ping failed for key ID ${id}: ${pingErr.message}`);
      
      const isBanned = pingErr.message.toLowerCase().includes('403') || 
                       pingErr.message.toLowerCase().includes('400') || 
                       pingErr.message.toLowerCase().includes('invalid') || 
                       pingErr.message.toLowerCase().includes('key not valid');
      
      const updates = {};
      if (isBanned) {
        updates.isBanned = true;
      } else {
        updates.cooldownUntil = new Date(Date.now() + 30 * 1000); // 30s cooldown
      }
      
      await keyRecord.update(updates);

      return res.status(400).json({
        message: isBanned ? 'API Key không hợp lệ hoặc đã bị Google khóa (Banned)' : 'API Key đang tạm thời bị Rate Limit hoặc lỗi mạng',
        error: pingErr.message,
        data: keyRecord
      });
    }
  } catch (error) {
    console.error('pingKey error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
