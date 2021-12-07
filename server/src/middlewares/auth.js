const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  //get token from header
  const authentication = req.header("Authorization");
  const token = authentication && authentication.split(" ")[1];

  //response if no token
  if (!token) {
    return res.status(401).send({ message: "Access Denied!" });
  }

  try {
    //verify token
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    //put data from token to req.user
    req.user = verified;

    next();
  } catch (error) {
    res.status(400).send({
      message: "invalid token",
    });
  }
};
