'use strict';
/**
 * Dashboard service providing summary, time‑series, and analytics data for admin.
 */
const db = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  /** Summary counts */
  async getSummary() {
    const [totalUsers, totalPlants, totalGardenPlants, totalCategories, totalStores, totalReminders, totalCareHistories] = await Promise.all([
      db.User.count(),
      db.Plant.count(),
      db.GardenPlant.count(),
      db.Category ? db.Category.count() : 0,
      db.Store ? db.Store.count() : 0,
      db.Reminder ? db.Reminder.count() : 0,
      db.CareHistory ? db.CareHistory.count() : 0,
    ]);

    // Users registered in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await db.User.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    // GardenPlants added in the last 7 days
    const newGardenPlantsThisWeek = await db.GardenPlant.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    return {
      totalUsers,
      totalPlants,
      totalGardenPlants,
      totalCategories,
      totalStores,
      totalReminders,
      totalCareHistories,
      newUsersThisWeek,
      newGardenPlantsThisWeek,
    };
  },

  /** Time‑series: new users per day for last N days */
  async getUserTimeseries(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const data = await db.User.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: since } },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']]
    });
    return data.map(row => ({ date: row.get('date'), count: parseInt(row.get('count'), 10) }));
  },

  /** Time-series: new garden plants per day for last N days */
  async getGardenPlantTimeseries(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const data = await db.GardenPlant.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: since } },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']]
    });
    return data.map(row => ({ date: row.get('date'), count: parseInt(row.get('count'), 10) }));
  },

  /** Garden plants grouped by category */
  async getPlantsByCategory() {
    if (!db.Category) return [];
    const data = await db.GardenPlant.findAll({
      attributes: [
        'categoryId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('GardenPlant.id')), 'count']
      ],
      include: [{
        model: db.Category,
        attributes: ['name'],
      }],
      group: ['categoryId', 'Category.id'],
      raw: true,
      nest: true,
    });
    return data.map(row => ({
      category: row.Category?.name || 'Chưa phân loại',
      count: parseInt(row.count, 10)
    }));
  },

  /** Garden plants grouped by status */
  async getPlantsByStatus() {
    const data = await db.GardenPlant.findAll({
      attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true,
    });

    const statusMap = {
      'healthy': 'Khỏe mạnh',
      'sick': 'Đang bệnh',
      'thirsty': 'Cần nước',
      'Khỏe mạnh': 'Khỏe mạnh',
      'Đang bệnh': 'Đang bệnh',
      'Đang khát': 'Cần nước'
    };

    const groupedData = {};

    data.forEach(row => {
      const rawStatus = row.status || 'Không rõ';
      const mappedStatus = statusMap[rawStatus] || rawStatus;
      
      if (!groupedData[mappedStatus]) {
        groupedData[mappedStatus] = 0;
      }
      groupedData[mappedStatus] += parseInt(row.count, 10);
    });

    return Object.keys(groupedData).map(status => ({
      status,
      count: groupedData[status]
    }));
  },

  /** Stores grouped by type */
  async getStoresByType() {
    if (!db.Store) return [];
    const data = await db.Store.findAll({
      attributes: [
        'type',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true,
    });
    return data.map(row => ({
      type: row.type === 'nursery' ? 'Vườn ươm' : 'Cửa hàng',
      count: parseInt(row.count, 10)
    }));
  },

  /** Care history grouped by action type */
  async getCareByType() {
    if (!db.CareHistory) return [];
    const data = await db.CareHistory.findAll({
      attributes: [
        'actionType',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['actionType'],
      raw: true,
    });
    return data.map(row => ({
      type: row.actionType || 'Khác',
      count: parseInt(row.count, 10)
    }));
  },

  /** Recent users (last 5) */
  async getRecentUsers(limit = 5) {
    const users = await db.User.findAll({
      attributes: ['id', 'fullName', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      raw: true,
    });
    return users;
  }
};
