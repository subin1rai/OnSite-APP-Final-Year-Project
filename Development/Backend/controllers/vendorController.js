const prisma = require("../utils/prisma.js");
const Tesseract = require("tesseract.js");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Extracting Text from Image 
const extractTextFromImage = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng", {
            logger: m => console.log(m)
        });
        return text;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("OCR Processing Failed!");
    }
};


const addVendor = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded!" });
        }

        const imageBuffer = req.file.buffer;

        // image to Cloudinary
        cloudinary.uploader.upload_stream({ folder: "vendors" }, async (error, result) => {
            if (error) {
                return res.status(500).json({ error: "Upload to Cloudinary failed" });
            }

            const imageUrl = result.secure_url;

            // Extracting text from image
            const text = await extractTextFromImage(imageBuffer);

            //Vendor Details
            const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
            const vendorName = lines.length > 0 ? lines[0] : "Unknown";

            const businessMatch = text.match(/(?:Business|Company|Consultant|Firm|Agency|Enterprise|Solutions|Inc|Ltd|Corporation)[:\s]*([^\n\r]+)/i);
            const businessName = businessMatch ? businessMatch[1].trim() : "Unknown";

            const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const phoneMatch = text.match(/(\+?\d{1,4}[-.\s]?\(?\d{2,5}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,5})/);
            const addressMatch = text.match(/([A-Za-z\s\d,-]+(?:Nepal|USA|India|UK|Canada|Germany|France|Australia|China|Japan|UAE|Qatar))/i);

            // Save Vendor
            const newVendor = await prisma.vendor.create({
                data: {
                    VendorName: vendorName,
                    companyName: businessName,
                    email: emailMatch ? emailMatch[0] : "Unknown",
                    contact: phoneMatch ? phoneMatch[0].trim() : "Unknown",
                    address: addressMatch ? addressMatch[1].trim() : "Unknown",
                    profile: imageUrl
                }
            });

            res.json({ success: true, message: "Vendor Added!", vendor: newVendor });
        }).end(imageBuffer);

    } catch (error) {
        console.error("Vendor Add Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get All Vendors
const getAllVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany();
        res.status(200).json({ success: true, totalVendors: vendors.length, vendors });
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { upload, addVendor, getAllVendors };
