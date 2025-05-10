"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class file extends Model {
    static associate(models) {
      this.belongsTo(models.folder, { foreignKey: "folderID" });
      this.hasMany(models.fileDetail, { foreignKey: "fileID" });
    }
  }
  file.init(
    {
      fileID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      folderID: DataTypes.INTEGER,
      fileName:DataTypes.STRING,
      fileStatus: { type: DataTypes.TINYINT, defaultValue: 1 },
      fileAction: { type: DataTypes.TINYINT, defaultValue: 1 },
    },
    { sequelize, modelName: "file", tableName: "file", timestamps: false }
  );
  return file;
};
