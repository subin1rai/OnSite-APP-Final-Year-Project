const prisma = require("../utils/prisma.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password didn't match !" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = 10;

    const hashPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: name,
        email: email,
        password: hashPassword,
      },
    });
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const result = res.status(201).json({
      message: "User created successfully",
      user, 
      token,
      status: 201,
    });
    return result;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    console.log("login : hit");
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username},
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );
    return res.status(200).json({
      message: "Login successful",
      user,
      token,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const checkTokenExpiration = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from Bearer header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token is valid
      return res.status(200).json({
        valid: true,
        message: "Token is valid",
        expiresIn: new Date(decoded.exp * 1000),
      });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          valid: false,
          message: "Token has expired",
        });
      }
      return res.status(401).json({
        valid: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Invalidate the token by setting its expiration to the current time
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    decoded.exp = Math.floor(Date.now() / 1000);

    // Sign a new token with immediate expiration
    const invalidatedToken = jwt.sign(decoded, process.env.JWT_SECRET);

    return res.status(200).json({
      message: "Logout successful",
      token: invalidatedToken,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const root = async (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
};

module.exports = {
  root,
  signUp,
  login,
  checkTokenExpiration,
  logout,
};
