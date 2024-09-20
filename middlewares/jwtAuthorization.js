import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
