import { Op } from "sequelize";
import db from "../models/index";
// hàm lấy dữ liệu tất cả folder của 1 người
let getAllFoldersServiceUser = (userID, offset , limit ) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let offsetInt = parseInt(offset);
      let limitInt = parseInt(limit);
      let folders = await db.folder.findAll({
        where: { userID },
        order: [["dateRecomment", "DESC"]],
        include: [{ model: db.users, attributes: ['userName'] }],
        offset: offsetInt, // Sử dụng offset
        limit: limitInt, // Sử dụng limit
        raw: false,
      });

      if (folders) {
        data.errCode = 0;
        data.data = folders;
        data.offset = offsetInt;
      } else {
        data.errCode = 1;
        data.data = [];
      }

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
// hàm lấy dữ liệu tất cả các folder trừ của người dùng
let getAllFoldersExceptUserService = (userID, offset , limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let offsetInt = parseInt(offset);
      let limitInt = parseInt(limit);
      let folders = await db.folder.findAll({
       where: { userID: { [Op.ne]: userID } },
        order: [["dateRecomment", "DESC"]],
        include: [{ model: db.users, attributes: ['userName'] }],
        offset: offsetInt, // Sử dụng offset
        limit: limitInt, // Sử dụng limit
        raw: false,
      });

      if (folders) {
        data.errCode = 0;
        data.data = folders;
        data.offset = offsetInt;
      } else {
        data.errCode = 1;
        data.data = [];
      }

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
//Hàm kiểm tra folder tồn tại
let checkFolder = (folderName, userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let folder = await db.folder.findOne({
        where: { folderName, userID },
      });
      if (folder) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
};
// hàm tạo folder
let createFolderService = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let checkFolderIn = await checkFolder(
        dataBody.folderName,
        dataBody.userID
      );
      if (checkFolderIn) {
        let createFolder = await db.folder.create({
          folderName: dataBody.folderName,
          userID: dataBody.userID,
        });
        if (createFolder) {
          data.errCode = 0;
          data.message = "Tạo thư mục thành công";
          data.data = {
            folderID:createFolder.folderID,
            folderName:createFolder.folderName ,
            userID:createFolder.userID,
            folderStatus:createFolder.folderStatus,
            dateRecomment:createFolder.dateRecomment,
            numberOfVisits:createFolder.numberOfVisits,
             user:{
            userName: dataBody.userName,
          }
          };
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
//hàm cập nhật thời gian
const updateFolderTimestamp = async (folderID) => {
  await db.folder.update(
    {
      dateRecomment: new Date(),
    },
    {
      where: { folderID },
    }
  );
};
//hàm lấy dữ liệu chi tiết của từng folder
// let getFolderDetailService = (folderID,userID,offset , limit)=>{
//     return new Promise(async(resolve, reject) => {
//         try {
//             let data={}
//                   let offsetInt = parseInt(offset);
//       let limitInt = parseInt(limit);
//             let folderDetail = await db.folder.findOne({
//                 where: { folderID },
//                 attributes: ['folderName','userID','folderID'], 
//                 include: [
//                   {
//                     model: db.file,
//                     attributes: ['fileName','fileID','folderID'] ,
//                   },
//                 ],
//                  offset: offsetInt, // Sử dụng offset
//         limit: limitInt, // Sử dụng limit
//                 raw:false
//               });
//             if (folderDetail) {
                
//                 if (folderDetail.userID == userID) {
//                     await updateFolderTimestamp(folderID)
//                 }else{
//                     await db.folder.increment('numberOfVisits',{
//                         by:1,
//                         where:{folderID}
//                     })
//                 }
//                 data.errCode=0
//                 data.data = folderDetail,
//                 data.offset = offsetInt;
//             } else{
//                 data.errCode=1
//                 data.data = []
//             }
//             resolve(data)
//         } catch (e) {
//             reject(e)
//         }
//     })
// }
let getFolderDetailService = (folderID, userID, offset, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let offsetInt = parseInt(offset);
      let limitInt = parseInt(limit);

      // Lấy thông tin folder
      let folder = await db.folder.findOne({
        where: { folderID },
        attributes: ['folderName', 'userID', 'folderID'],
        raw: false,
      });

      if (!folder) {
        data.errCode = 1;
        data.data = [];
        return resolve(data);
      }

      // Cập nhật timestamp hoặc lượt xem
      if (folder.userID == userID) {
        await updateFolderTimestamp(folderID);
      } else {
        await db.folder.increment('numberOfVisits', {
          by: 1,
          where: { folderID },
        });
      }

      // Lấy danh sách file trong folder có phân trang
      const files = await db.file.findAll({
        where: { folderID },
        attributes: ['fileName', 'fileID', 'folderID'],
        offset: offsetInt,
        limit: limitInt
      });

      data.errCode = 0; 
      data.data = {
        folderName: folder.folderName,
        folderID: folder.folderID,
        userID: folder.userID,
        files: files,
      };
      data.offset = offsetInt;

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
//Hàm cập nhật lại tên folder
let updateFolderNameService = (folderID, newFolderName, userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};

      let isFolderNameAvailable = await checkFolder(newFolderName, userID);
      if (isFolderNameAvailable) {
        let updatedFolder = await db.folder.update(
          { folderName: newFolderName },
          { where: { folderID, userID } }
        );
        if (updatedFolder[0] > 0) {
          data.errCode = 0;
          data.message = "Cập nhật tên thư mục thành công";
          data.data={
            folderID: folderID,
            newFolderName: newFolderName,
          }
        } else {
          data.errCode = 1;
          data.message = "Không tìm thấy thư mục để cập nhật";
        }
      } else {
        data.errCode = 2;
        data.message = "Tên thư mục đã tồn tại";
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
// Hàm xóa folder
let deleteFolderService = (folderID, userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let folder = await db.folder.findOne({
        where: { folderID, userID },
      });

      if (folder) {
        await db.folder.destroy({
          where: { folderID, userID },
        });
        data.errCode = 0;
        data.message = "Xóa thư mục thành công";
        data.data = folderID
      } else {
        data.errCode = 1;
        data.message = "Không tìm thấy thư mục để xóa";
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};

// Hàm tìm kiếm dữ liệu theo từ khóa và bảng
let searchFoldersService = (key, userID) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let folders = await db.folder.findAll({
        where: {
          userID,
          folderName: { [Op.like]: `%${key}%` },
        },
        order: [["dateRecomment", "DESC"]],
        include: [
          {
            model: db.users,
            attributes: ['userName'],
          },
        ],
        raw: false,
      });

      if (folders && folders.length > 0) {
        data.errCode = 0;
        data.data = folders;
      } else {
        data.errCode = 1;
        data.data = [];
        data.message = "Không tìm thấy thư mục phù hợp";
      }

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  getAllFoldersServiceUser: getAllFoldersServiceUser,
  getAllFoldersExceptUserService: getAllFoldersExceptUserService,
  createFolderService: createFolderService,
  getFolderDetailService:getFolderDetailService,
  updateFolderNameService:updateFolderNameService,
  deleteFolderService:deleteFolderService,
  searchFoldersService:searchFoldersService
};

