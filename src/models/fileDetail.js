"use strict";
const { Model, DataTypes } = require("sequelize");


// FileDetail Model
module.exports = (sequelize) => {
    class fileDetail extends Model {
      static associate(models) {
        this.belongsTo(models.file, { foreignKey: "fileID" });
      }
    }
    fileDetail.init(
      {
        detailID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
              },
        fileID: { type: DataTypes.INTEGER },
        fileSource: DataTypes.STRING,
        fileTarget: DataTypes.STRING,
        fileDetailStatus: { type: DataTypes.TINYINT, defaultValue: 1 },
      },
      { sequelize, modelName: "fileDetail", tableName: "fileDetail", timestamps: false }
    );
    return fileDetail;
  };
  