"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      this.hasMany(models.folder, { foreignKey: "userID" });
    }
  }
  users.init(
    {
      userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userAccount: DataTypes.STRING,
      userPassword: DataTypes.STRING,
      userName: DataTypes.STRING,
      userGmail: DataTypes.STRING,
      userPhone: DataTypes.STRING(10),
      userStatus: { type: DataTypes.TINYINT, defaultValue: 0 },
      userAction: { type: DataTypes.TINYINT, defaultValue: 1 },
      refreshToken: DataTypes.STRING,
      googleID:{ type: DataTypes.STRING, defaultValue: null},
      type:{ type: DataTypes.STRING, defaultValue: "LOCAL"},
    },
    {
      sequelize,
      modelName: "users",
      tableName: "users",
      timestamps: false,
    }
  );
  return users;
};
