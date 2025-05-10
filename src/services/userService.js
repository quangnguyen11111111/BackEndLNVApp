import db from "../models/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const salt = bcrypt.genSaltSync(10);

//Create account
let createNewUsers = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let checkAccount = await checkAccountTrueFalse(dataBody.userAccount);
      if (checkAccount) {
        let passwordHash = await hashPassword(dataBody.userPassword);
        let createAccount = await db.users.create({
          userAccount: dataBody.userAccount,
          userPassword: passwordHash,
          userName: dataBody.userName,
          userGmail: dataBody.userGmail,
          userPhone: dataBody.userPhone,
        });
        if (createAccount) {
          (data.errCode = 0), (data.message = "Đăng kí thành công!!");
        } else {
          (data.errCode = 1), (data.message = "Đăng kí không thành công!!");
        }
      } else {
        (data.errCode = 1), (data.message = "Tài khoản đã tồn tại ??");
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
// Nếu có tài khoản trả về false ngược lại là true
let checkAccountTrueFalse = (account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await db.users.findOne({
        where: { userAccount: account },
        raw: true,
      });
      if (check) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let hashPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashpassword = await bcrypt.hashSync(password, salt);
      resolve(hashpassword);
    } catch (e) {
      reject(e);
    }
  });
};
//generateAccessToken
let generateAccessToken = (user) => {
  return jwt.sign(
    {
      userID: user.userID,
      userName: user.UserName,
      userGmail: user.Gmail,
      userPhone: user.userPhone || " ",
    },
    process.env.SECRET_KEY,
    { expiresIn: "5h" }
  );
};
//generateRefreshToken
let generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userID: user.userID,
      userName: user.UserName,
      userGmail: user.Gmail,
      userPhone: user.userPhone || " ",
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
// Login app
let LoginServices = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let checkAccount = await checkAccountTrueFalse(dataBody.userAccount);
      if (!checkAccount) {
        let user = await db.users.findOne({
          where: { userAccount: dataBody.userAccount },
          raw: true,
        });
        let checkPassword = bcrypt.compareSync(
          dataBody.userPassword,
          user.userPassword
        );
        if (!checkPassword) {
          data.errCode = 1;
          data.message = "Mật khẩu không đúng";
          data.data = [];
        } else {
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);
          await db.users.update(
            { refreshToken },
            { where: { userID: user.userID }, raw: true }
          );
          data.errCode = 0;
          data.message = "Đăng nhập thành công";
          delete user.userPassword;
          delete user.refreshToken;
          data.data = user;
          data.accessToken = accessToken;
          data.refreshToken = refreshToken;
        }
      } else {
        data.errCode = 1;
        data.message = "Tài khoản hoặc mật khẩu không chính xác";
        data.data = [];
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
//Làm mới Access Token
let refreshToken = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let decoded;
      try {
        decoded = jwt.verify(dataBody, process.env.REFRESH_SECRET);
        let user = await db.users.findOne({
          where: { userID: decoded.userID },
        });
        if (!user || user.refreshToken !== dataBody) {
          (data.errCode = 4), (data.message = "Token không hợp lệ");
        } else {
          const newAccessToken = generateAccessToken(user);
          (data.errCode = 0),
            (data.message = "Token làm mới thành công"),
            (data.newAccessToken = newAccessToken);
          delete user.userPassword;
          data.data = user;
        }
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return resolve({ errCode: 2, message: "Token đã hết hạn!" });
        }
        if (error.name === "JsonWebTokenError") {
          return resolve({ errCode: 3, message: "Token không hợp lệ!" });
        }
        return reject(error);
      }

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
//Hàm xử lí đăng nhập bằng google
let loginWithGoogleService = (dataBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = {};
      let user = await db.users.findOne({
        where: { userAccount: dataBody.userAccount },
        raw: true,
      });
      if (user) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await db.users.update(
          { refreshToken },
          { where: { userID: user.userID }, raw: true }
        );
        data.errCode = 0;
        data.message = "Đăng nhập thành công";
        delete user.userPassword;
        delete user.refreshToken;
        data.data = user;
        data.accessToken = accessToken;
        data.refreshToken = refreshToken;
      } else {
        let user = await db.users.create({
          userAccount: dataBody.userAccount,
          userGmail: dataBody.userGmail,
          userName: dataBody.userName,
          userPhone: dataBody.userPhone,
          type: "GOOGLE",
        });
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await db.users.update(
          { refreshToken },
          { where: { userID: user.userID }, raw: true }
        );
        delete user.userPassword;
        delete user.refreshToken;
        data.data = user;
        data.accessToken = accessToken;
        data.refreshToken = refreshToken;
        data.errCode = 0;
        data.message = "Đăng nhập thành công";
      }
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  createNewUsers: createNewUsers,
  LoginServices: LoginServices,
  refreshToken: refreshToken,
  loginWithGoogleService: loginWithGoogleService,
};
