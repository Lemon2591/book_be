const { ERROR_MESSAGE } = require("../config/error");

const Response = (handel) => {
  return async (req, res, next) => {
    try {
      const data = await handel(req, res, next);
      return res.send({
        message: "Thành công !",
        statusCode: 200,
        data: data,
      });
    } catch (err) {
      console.log(err);
      const code = err && err.message ? err.message : ERROR_MESSAGE.ERROR;
      return res.send({
        message: code ? code : ERROR_MESSAGE.ERROR,
        statusCode: 400,
        data: [],
      });
    }
  };
};

module.exports = {
  Response,
};
