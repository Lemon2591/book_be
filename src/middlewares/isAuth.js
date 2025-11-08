const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
const { UserStorage, Users } = require("../models");

const isAuthApp = async (req, res, next) => {
  const { auth_t } = req.cookies;

  if (!auth_t) {
    return res.status(200).json({
      statusCode: 403,
      message: "Tài khoản chưa được xác thực",
    });
  }

  const decoded = jwt.verify(
    auth_t,
    process.env.JWT_ACCESS_KEY,
    (err, user) => {
      if (err) {
        if (err?.message == "jwt expired") {
          return {
            statusCode: 404,
            message: "Token đã hết hạn !",
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

  next();
};

const isAuthShare = async (req, res, next) => {
  const { api_keys, secret_keys } = req.headers;

  try {
    if (!api_keys || !secret_keys) {
      return res.status(200).json({
        statusCode: 400,
        message: "Không có quyền truy cập api này !",
      });
    }
    var decode_secret_keys = JSON.parse(
      crypto.AES.decrypt(secret_keys, process.env.HASH_SCRIPT).toString(
        crypto.enc.Utf8
      )
    );
    if (
      !decode_secret_keys ||
      !decode_secret_keys?.id ||
      !decode_secret_keys?.email
    ) {
      return res.status(200).json({
        statusCode: 400,
        message: "Không có quyền truy cập api này !",
      });
    }

    const data_user = await UserStorage.findOne({
      where: {
        user_id: decode_secret_keys?.id,
      },
      raw: true,
    });

    const checkUser = await Users.findOne({
      where: {
        id: decode_secret_keys?.id,
        email: decode_secret_keys?.email,
      },
      raw: true,
    });

    if (checkUser?.is_delete === 1) {
      return res.status(200).json({
        statusCode: 400,
        message:
          "Tài khoản của bạn đã bị khoá, vui lòng liên hệ admin để được hỗ trợ !",
      });
    }

    if (data_user?.api_key.toString() !== api_keys.toString()) {
      return res.status(200).json({
        statusCode: 400,
        message: "Không có quyền truy cập api này !",
      });
    }
    next();
  } catch (error) {
    return res.status(200).json({
      statusCode: 400,
      message: "Không có quyền truy cập api này !",
    });
  }
};

module.exports = {
  isAuthApp,
  isAuthShare,
};
