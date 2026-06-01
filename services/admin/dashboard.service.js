'use strict';
/**
 * Dashboard service providing summary and time‑series data for admin.
 */
const db = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  /** Summary counts */
  async getSummary() {
    const [users, plants, gardenPlants] = await Promise.all([
      db.User.count(),
      db.Plant.count(),
      db.GardenPlant.count()
    ]);
    return { users, plants, gardenPlants };
  },

  /** Time‑series: new users per day for last 30 days */
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
    // format as array of {date, count}
    return data.map(row => ({ date: row.get('date'), count: parseInt(row.get('count'), 10) }));
  }
};
