const prisma = require("../utils/prisma.js");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addWorker = async (req, res) => {
  try {
    const { name, contact, designation, salary} = req.body;
    const user = req.user.userId;
    console.log(req.body);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    cloudinary.uploader
      .upload_stream({ folder: "uploads" }, async (error, result) => {
        if (error) {
          return res.status(500).json({ error: "Upload to Cloudinary failed" });
        }

        const savedWorker = await prisma.worker.create({
          data: {
            name: name,
            contact: contact,
            profile: result.secure_url,
            designation: designation,
            salary: salary,
            builderId: user
          },
        });

        res.json({
          message: "Upload successful",
          savedWorker,
        });
      })
      .end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateWorkerShifts = async (req,res)=>{

}

const allWorkers = async(req,res)=>{
  try {
    const user = req.user.userId;
    console.log("hello",user);
    const workers = await prisma.worker.findMany({
      where: {
        builderId: user,
      }
    });
    
    return res.status(200).json({message:"All workers",status:200,workers});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });  
  }
}

module.exports = { upload, addWorker, allWorkers };
