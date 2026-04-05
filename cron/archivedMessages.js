const cron = require("node-cron");
const { Op } = require("sequelize");

const Message = require("../models/message");
const ArchivedMessage = require("../models/archivedMessages");

// run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running archive job...");

  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // 1. get old messages
    const oldMessages = await Message.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    if (oldMessages.length === 0) {
      console.log("No messages to archive");
      return;
    }

    // 2. move to archive table
    const archiveData = oldMessages.map((msg) => ({
      text: msg.text,
      type: msg.type,
      roomId: msg.roomId,
      UserId: msg.UserId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    await ArchivedMessage.bulkCreate(archiveData);

    // 3. delete from main table
    await Message.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    console.log(`✅ Archived ${oldMessages.length} messages`);
  } catch (err) {
    console.error("❌ Archive job failed:", err);
  }
});
