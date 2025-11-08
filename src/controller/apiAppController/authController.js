const { AuthService } = require("../../service");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../../libs/utils");

const loginController = (req, res) => {
  const { user_name, password } = req.body;
  const ip =
    req.socket.remoteAddress?.split(":")[
      req.socket.remoteAddress?.split(":")?.length - 1
    ];

  return AuthService.loginService(user_name, password, ip, res);
};

const registerController = (req, res) => {
  const { full_name, email, password, cPassword } = req.body;

  return AuthService.registerService(full_name, email, password, cPassword);
};

const retryOTP = (req, res) => {
  const { id, email } = req?.body;
  return AuthService.retryOTOService(id, email);
};

const veryOTP = (req, res) => {
  const { email, otp } = req?.body;

  const ip =
    req.socket.remoteAddress?.split(":")[
      req.socket.remoteAddress?.split(":")?.length - 1
    ];
  return AuthService.veryOTOService(email, otp, ip, res);
};

const getUser = (req, res) => {
  const { auth_t } = req.cookies;
  return AuthService.getUser(auth_t);
};

const createStore = (req, res) => {
  const { id, email } = req.body;
  return AuthService.createStoreService(id, email);
};

const getRefreshToken = async (req, res) => {
  const { auth_r } = req.cookies;
  if (!auth_r) {
    return res.status(200).json({
      message: "Phiên đăng nhập đã hết hạn !",
      statusCode: 403,
    });
  }

  const decoded = jwt.verify(
    auth_r,
    process.env.JWT_REFRESH_KEY,
    (err, user) => {
      if (err) {
        if (err?.message == "jwt expired") {
          return {
            statusCode: 404,
            message: "Phiên đăng nhập đã hết hạn !",
          };
        }
        return {
          statusCode: 403,
          message: "Token không hợp lệ !",
        };
      }
      return user;
    }
  );
  if (!decoded || !decoded?.userID) {
    return res.status(200).json({
      statusCode: decoded?.statusCode,
      message: decoded?.message,
    });
  }

  const new_token = await generateToken({
    id: decoded.userID,
  });

  return res.status(200).json({
    statusCode: 200,
    data: new_token,
  });
};

const logoutController = (req, res) => {
  res.clearCookie("auth_r");
  res.clearCookie("auth_t");

  return "Logout";
};

module.exports = {
  loginController,
  logoutController,
  registerController,
  retryOTP,
  veryOTP,
  getUser,
  createStore,
  getRefreshToken,
};
