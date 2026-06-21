const cron = require("node-cron");
const NotificationService = require("../services/client/notification.service");
const { User, GardenPlant, Reminder, Plant } = require("../models");
const { Op } = require('sequelize');

const initReminderJob = () => {
  cron.schedule('*/15 * * * * *', async () => {
    try {
      const now = new Date();
      const reminders = await Reminder.findAll({
        include: [
          {
            model: GardenPlant,
            required: true,
            include: [
              {
                model: User,
                required: false,
              },
              { model: Plant, attributes: ['name'] }
            ],
          },
        ]
      });

      for (const reminder of reminders) {
        if (!reminder.isPushEnabled) continue;
        if (!reminder.GardenPlant) continue;

        const lastAction = new Date(reminder.lastActionAt);
        const minutesSinceLastAction = Math.floor((now - lastAction) / (1000 * 60));

        if (minutesSinceLastAction >= reminder.frequencyDays * 1440) {
          console.log(`Triggering reminder: ${reminder.type} for plant ${reminder.GardenPlant.Plant?.name}, minutes: ${minutesSinceLastAction}/${reminder.frequencyDays * 1440}`);

          if (reminder.type === 'Tưới nước') {
            const gp = reminder.GardenPlant;
            if (gp && gp.status !== 'Đang khát' && gp.status !== 'thirsty' && gp.status !== 'Đang bệnh' && gp.status !== 'sick') {
              gp.status = 'Đang khát';
              await gp.save();
              console.log(`Updated status of plant ${gp.id} to Đang khát`);
            }
          }

          if (reminder.lastNotificationSentAt) {
            const lastSent = new Date(reminder.lastNotificationSentAt);

            const isSentToday = lastSent.getDate() === now.getDate() &&
              lastSent.getMonth() === now.getMonth() &&
              lastSent.getFullYear() === now.getFullYear();

            if (isSentToday) {
              console.log("chay")
              continue;
            }
          }
          // Send notification
          const user = reminder.GardenPlant.User;
          if (user && user.fcmToken) {
            console.log(`User FCM token: ${user.fcmToken ? 'YES' : 'NO'}`);
            const title = `Nhắc nhở chăm sóc cây ${reminder.GardenPlant.Plant?.name || 'của bạn'}`;
            const body = `Đã đến lúc ${reminder.type === 'Tưới nước' ? 'tưới nước' : 'bón phân'} cho cây!`;

            await NotificationService.sendReminderNotification(
              user.fcmToken,
              title,
              body,
              { 
                reminderId: reminder.id.toString(), 
                gardenPlantId: reminder.gardenPlantId.toString(),
                type: reminder.type 
              }
            );

            reminder.lastNotificationSentAt = new Date();
            await reminder.save();
            console.log(`Notification sent to ${user.fullName} for ${reminder.type}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  })
};

module.exports = { initReminderJob };