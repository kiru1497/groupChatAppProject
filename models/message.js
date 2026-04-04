const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const Message = sequelize.define("Message", {
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
    type: DataTypes.STRING, // "group" or "personal"
  },
  roomId: {
    type: DataTypes.STRING,
  },
});

module.exports = Message;
