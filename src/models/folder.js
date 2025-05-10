"use strict";
const { Model, DataTypes } = require("sequelize");
// Folder Model
module.exports = (sequelize) => {
    class folder extends Model {
      static associate(models) {
        this.belongsTo(models.users, { foreignKey: "userID" });
        this.hasMany(models.file, { foreignKey: "folderID" });
      }
    }
    folder.init(
      {
        folderID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        folderName: DataTypes.STRING,
        userID: DataTypes.INTEGER,
        folderStatus: { type: DataTypes.TINYINT, defaultValue: 1 },
        dateRecomment:{ type:  DataTypes.DATE, defaultValue: new Date()},
      numberOfVisits: { type: DataTypes.INTEGER, defaultValue: 0 },
      },
      { sequelize, modelName: "folder", tableName: "folder", timestamps: false }
    );
    return folder;
  };