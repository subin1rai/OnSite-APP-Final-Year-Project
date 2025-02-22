
const prisma = require("../utils/prisma.js");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Email is already taken" });
      }
    }
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      // Upload to Cloudinary
      cloudinary.uploader
        .upload_stream({ folder: "uploads" }, async (error, result) => {
          if (error) {
            return res.status(500).json({ error: "Upload to Cloudinary failed" });
          }
  
          const updateUser = await prisma.user.update({
            where: { id: userId },
            data: {
              username: name,
              email: email,
              image: result.secure_url
            },
          });
  
          res.json({
            message: "user updated successful",
            updateUser
          });
        })
        .end(req.file.buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const getuser = async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await prisma.user.findFirst({
        where: { id: userId },
      });
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

module.exports = { updateUser, upload, getuser };

