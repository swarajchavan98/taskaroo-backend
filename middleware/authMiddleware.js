const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  // console.log("Tokennn:", token)
  if(!token) return res.status(403).json({ error: "Unauthorized" });

  try {
    // console.log("Trying to verify token")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded)
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Ohh mannn!", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    
    console.error("Token verification failed", error);
    res.status(403).json({ error: "Invalid token" });
  }
}