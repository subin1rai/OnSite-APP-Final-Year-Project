const prisma = require("../utils/prisma.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer.js");
const validator = require("validator");
const { generatePasswordResetTemplate } = require("../utils/emailtemplate.js");

const signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
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

    if(!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be  strong !" });
    }

    const salt = 10;

    const hashPassword = await bcrypt.hash(password, salt);

    //generate random unique 5 digit number
    const randomId = Math.floor(10000 + Math.random() * 90000);

    const user = await prisma.user.create({
      data: {
        username: name,
        email: email,
        shareid: parseInt(randomId),
        password: hashPassword,
      },
    });

    const result = res.status(201).json({
      message: "User created successfully",
      status: 201,
    });
    return result;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
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
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2hrs" }
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
      status: 200,
    });
  } catch (error) {
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
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const root = async (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
};

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
 
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
   
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: hashedOTP },
    });

    res.status(200).json({ message: "OTP sent to email" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is ${otp}. This code will expire in 6 minutes.`,
      html: generatePasswordResetTemplate(otp)
    };
    
    await transporter.sendMail(mailOptions);
    // Clear the OTP after 6 minutes
    setTimeout(async () => {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null },
        });
      } catch (error) {
        console.error("Error clearing OTP:", error.message);
      }
    }, 360000);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(req.body);
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    // Clear OTP after successful verification
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null },
    });
    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Password is not strong" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  root,
  signUp,
  login,
  checkTokenExpiration,
  logout,
  requestOTP,
  verifyOTP,
  resetPassword,
};
