import { Op } from "sequelize";
import db from "../models/index";
//hàm ấy dữ liệu detail file
let getAllDetailFileService = (fileID)=>{
    return new Promise(async(resolve, reject) => {
        try {
            let data={}
        let detailFile = await db.fileDetail.findAll({
            attributes: {exclude:["fileID","fileDetailStatus"]},
            where:{
                fileID
            }
        })
        if (detailFile) {
            data.errCode=0
            data.data=detailFile
        }else{
            data.errCode=1
            data.data=[]
        }
        resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}
//Hàm kiểm tra file tồn tại
let checkFile = (fileName, folderID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let file = await db.file.findOne({
        where: { fileName, folderID },
      });
      if (file) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
};
//hàm tạo file
let createFileService = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let checkFileIn = await checkFile(
        dataBody.fileName,
        dataBody.folderID
      );
      if (checkFileIn) {
        let createFile = await db.file.create({
          fileName: dataBody.fileName,
          folderID: dataBody.folderID,
        });
        if (createFile) {
            console.log(dataBody,Array.isArray(dataBody.arrDataDetail));
            
            await addDetailFile(dataBody.arrDataDetail, createFile.fileID)
          data.errCode = 0;
          data.message = "Tạo thư mục thành công";
        }
      } else {
        data.errCode = 1;
        data.message = "Thư mục đã tồn tại";
        data.data = [];
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
// hàm thêm chi tiết file
let addDetailFile = async (dataBody, fileID) => {
    try {
      const dataWithFileID = dataBody.map(item => ({
        ...item,
        fileID
      }));
      console.log("dataWithFileID", dataWithFileID);
      
      await db.fileDetail.bulkCreate(dataWithFileID);
    } catch (error) {
      console.error("Lỗi khi thêm chi tiết file:", error);
    }
  };
// hàm chỉnh sửa file
let updateFileService = (fileID, dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let file = await db.file.findOne({
        where: { fileID },
      });
      if (file) {
        // Check if the file name already exists in the target folder
        let checkFileInTargetFolder = await checkFile(dataBody.fileName, dataBody.folderID);
        if (!checkFileInTargetFolder) {
          data.errCode = 2;
          data.message = "File đã tồn tại trong thư mục đích";
        } else {
          await db.file.update(
        {
          fileName: dataBody.fileName,
          folderID: dataBody.folderID, // Update folderID if provided
        },
        {
          where: { fileID },
        }
          );
          if (Array.isArray(dataBody.arrDataDetail)) {
        await db.fileDetail.destroy({
          where: { fileID },
        });
        await addDetailFile(dataBody.arrDataDetail, fileID);
          }
          data.errCode = 0;
          data.message = "Chỉnh sửa file thành công";
          data.data = {
        fileID: file.fileID,
        fileName: dataBody.fileName,
        folderID: dataBody.folderID,
        arrDataDetail: dataBody.arrDataDetail,
          };
        }
      } else {
        data.errCode = 1;
        data.message = "File không tồn tại";
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
//Hàm xóa file
let deleteFileService = (fileID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let file = await db.file.findOne({
        where: { fileID },
      });
      console.log("file", file,fileID);
      if (file) {
        await db.file.destroy({
          where: { fileID },
        });
        data.errCode = 0;
        data.message = "Xóa file thành công";
        data.data=fileID
      } else {
        data.errCode = 1;
        data.message = "File không tồn tại";
        
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports={
    getAllDetailFileService:getAllDetailFileService,
    createFileService:createFileService,
    updateFileService:updateFileService,
    deleteFileService:deleteFileService
}