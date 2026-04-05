const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  type: {
    type: DataTypes.STRING,
  },

  roomId: {
    type: DataTypes.STRING,
  },

  UserId: {
    type: DataTypes.INTEGER,
  },
});

module.exports = ArchivedMessage;
