import folderService from '../services/folderService'
// hàm lấy dữ liệu folder của 1 người
let handleGetAllFoldersUser = async(req,res)=>{
    if (!req.query.userID) {
        return res.status(500).json({
            errCode: 1,
            data:[]
        })
    }
    let data = await folderService.getAllFoldersServiceUser(req.query.userID)
    return res.status(200).json({
        errCode: data.errCode,
        data:data.data
    })
}
// hàm lấy dữ liệu folder trừ 1 người
let handleGetAllFoldersExceptUser = async(req,res)=>{
    if (!req.query.userID) {
        return res.status(500).json({
            errCode: 0,
            data:[]
        })
    }
    let data = await folderService.getAllFoldersExceptUserService(req.query.userID)
    return res.status(200).json({
        errCode: data.errCode,
        data:data.data
    })
}
// hàm tạo folder
let handleCreateFolder = async(req,res)=>{
    let data = await folderService.createFolderService(req.body)
    return res.status(200).json({
        errCode:data.errCode,
        message:data.message,
        data:data.data
    }) 
}
// hàm lấy dữ liệu chi tiết folder
let handleGetFolderDetail = async(req,res)=>{``
    if (!req.query.folderID||!req.query.userID) {
        return res.status(500).json({
            errCode:1,
            data:[]
        })
    }
    let data = await folderService.getFolderDetailService(req.query.folderID,req.query.userID)
    return res.status(200).json({
        errCode:data.errCode,
        data:data.data.files,
        folderName:data.data.folderName,
        folderID:data.data.folderID
    })
}
//hàm cập nhật lại tên folder
let handleUpdateFolderName = async (req, res) => {
    if (!req.body.folderID ) {
        return res.status(500).json({
            errCode: 1,
            message: "Vui lòng truyền id thư mục"
        });
    }
    if ( !req.body.newFolderName) {
        return res.status(500).json({
            errCode: 1,
            message: "Vui lòng truyền tên thư mục mới"
        });
    }
    if (!req.body.userID) {
        return res.status(500).json({
            errCode: 1,
            message: "Vui lòng truyền mã người dùng"
        });
    }
    let data = await folderService.updateFolderNameService(req.body.folderID, req.body.newFolderName, req.body.userID);
    return res.status(200).json({
        errCode: data.errCode,
        message: data.message,
        data: data.data
    });
};
// hàm xóa folder
let handleDeleteFolder = async (req, res) => {
    if (!req.query.folderID) {
        return res.status(500).json({
            errCode: 1,
            message: "Vui lòng truyền id thư mục"
        });
    }
    if (!req.query.userID) {
        return res.status(500).json({
            errCode: 1,
            message: "Vui lòng truyền mã người dùng"
        });
    }
    let data = await folderService.deleteFolderService(req.query.folderID, req.query.userID);
    return res.status(200).json({
        errCode: data.errCode,
        message: data.message,
        data: data.data
    });
};
module.exports={
    handleGetAllFoldersUser:handleGetAllFoldersUser,
    handleGetAllFoldersExceptUser:handleGetAllFoldersExceptUser,
    handleCreateFolder:handleCreateFolder,
    handleGetFolderDetail:handleGetFolderDetail,
    handleUpdateFolderName:handleUpdateFolderName,
    handleDeleteFolder:handleDeleteFolder
}