// helper function

function setSecureCookie(res, token) {
  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 60 * 1000, // 1 minute
    secure: true,
    sameSite: "None",
  });

  return res;
}

module.exports = { setSecureCookie };
