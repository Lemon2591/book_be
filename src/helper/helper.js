const jwt = require("jsonwebtoken");

const puppeteer = require("puppeteer");

const circumventing = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(url);
  const urls = await page.$$eval("iframe", (el) =>
    [].map.call(el, (d) => d.src)
  );
  await browser.close();
  const _url = urls[0];
  return _url;
};

/* eslint-disable no-param-reassign */
const Paging = (page, limit) => {
  const paging = {};
  limit = parseInt(limit) || 20;
  page = parseInt(page) || 1;

  if (page && limit) {
    paging.offset = limit * (page - 1);
  }
  if (limit) {
    paging.limit = limit;
  }
  return paging;
};

const deToken = async (token) => {
  try {
    const tokens = token.split(" ")[1];
    var decoded = jwt.verify(tokens, process.env.JWT_ACCESS_KEY);

    return decoded;
  } catch (error) {
    return error;
  }
};

module.exports = {
  circumventing,
  Paging,
  deToken,
};
