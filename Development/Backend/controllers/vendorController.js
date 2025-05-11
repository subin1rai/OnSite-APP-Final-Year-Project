const prisma = require("../utils/prisma.js");
const Tesseract = require("tesseract.js");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OCR: Extract text from image using Tesseract
const extractTextFromImage = async (imageBuffer) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => console.log(m),
    });
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]{2,}/g, '\n')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("OCR Processing Failed: " + error.message);
  }
};

  const extractVendorDetails = (text) => {
  console.log("Original OCR Text:", text);
  // Normalize the text
  let normalizedText = text.replace(/\s+/g, ' ').trim();
  console.log("Normalized OCR Text:", normalizedText);

  // Extract known fields via regex
  const emailPattern = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/i;
  const phonePattern = /(?:\+\d{1,4}[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
  const websitePattern = /(www\.[\w.-]+\.[a-zA-Z]{2,})/i;

  const emailMatch = normalizedText.match(emailPattern);
  const phoneMatch = normalizedText.match(phonePattern);
  const websiteMatch = normalizedText.match(websitePattern);

  const email = emailMatch ? emailMatch[0] : null;
  const contact = phoneMatch ? phoneMatch[0] : null;
  let website = websiteMatch ? websiteMatch[0] : null;

  let remainingText = normalizedText;
  if (email) remainingText = remainingText.replace(email, '');
  if (contact) remainingText = remainingText.replace(contact, '');
  if (website) remainingText = remainingText.replace(website, '');
  remainingText = remainingText.trim();
  console.log("Remaining Text:", remainingText);

  // Split remaining text into segments (by comma)
  const segments = remainingText.split(",").map(seg => seg.trim()).filter(seg => seg.length > 0);
  console.log("Segments:", segments);

  // Define company keywords (case-insensitive)
  const companyKeywords = ["PVT", "LTD", "COMPANY", "CONSTRUCTION", "CORPORATION", "GROUP", "SOLUTIONS", "TECHNOLOGIES"];

  let companyName = "";
  let vendorName = "";
  let address = "";

  for (let seg of segments) {
    const segUpper = seg.toUpperCase();
    if (companyKeywords.some(keyword => segUpper.includes(keyword))) {
      // Use the first two words as a candidate
      const words = seg.split(" ");
      companyName = words.slice(0, 2).join(" ");
      break;
    }
  }
  console.log("Extracted Company Name:", companyName);

  for (let seg of segments) {
    const segTrim = seg.trim();
    if (segTrim === segTrim.toUpperCase() && segTrim.split(" ").length >= 2) {
      if (!companyKeywords.some(keyword => segTrim.toUpperCase().includes(keyword))) {
        vendorName = segTrim;
        break;
      }
    }
  }
  if (!vendorName && segments.length > 0) {
    let lastSeg = segments[segments.length - 1];
    if (lastSeg.split(" ").length >= 2) {
      vendorName = lastSeg;
    }
  }
  console.log("Extracted Vendor Name:", vendorName);

  // and that is not the company name or vendor name.
  for (let seg of segments) {
    if (seg !== companyName && seg !== vendorName && /\d/.test(seg)) {
      address = seg;
      break;
    }
  }
  if (!address && segments.length >= 2) {
    const idx = segments.findIndex(seg => seg === vendorName);
    if (idx !== -1 && idx < segments.length - 1) {
      address = segments[idx + 1];
    }
  }
  // Correct common OCR issues (e.g. Kathmand -> Kathmandu)
  if (address && /kathmand/i.test(address)) {
    address = address.replace(/kathmand/i, "Kathmandu");
  }
  console.log("Extracted Address:", address);

  return {
    VendorName: vendorName.trim(),
    companyName: companyName.trim(),
    email: email ? email.trim() : null,
    contact: contact ? contact.trim() : null,
    address: address.trim(),
    website: website ? website.trim() : null,
  };
};

// Add Vendor: Upload image, perform OCR, extract details, and store in DB
const addVendor = async (req, res) => {
  try {
    const user = req.user.userId;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }
    const imageBuffer = req.file.buffer;
    cloudinary.uploader.upload_stream({ folder: "vendors" }, async (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ success: false, error: "Upload to Cloudinary failed" });
      }
      try {
        const extractedText = await extractTextFromImage(imageBuffer);
        console.log("Raw extracted text:", extractedText);
        const vendorDetails = extractVendorDetails(extractedText);
        console.log("Extracted Details:", vendorDetails);
        if (!vendorDetails.VendorName || vendorDetails.VendorName === "Unknown") {
          return res.status(422).json({ success: false, error: "Could not extract vendor name from image" });
        }
        const newVendor = await prisma.vendor.create({
          data: {
            VendorName: vendorDetails.VendorName,
            companyName: vendorDetails.companyName || "Unknown",
            email: vendorDetails.email || null,
            contact: vendorDetails.contact || null,
            address: vendorDetails.address || "Unknown",
            profile: result.secure_url,
            builderId: user,
          },
        });
        res.json({
          success: true,
          message: "Vendor Added Successfully!",
          vendor: newVendor,
          extractedText,
          processedDetails: vendorDetails,
        });
      } catch (processingError) {
        console.error("Processing Error:", processingError);
        res.status(422).json({
          success: false,
          error: "Data Processing Failed",
          details: processingError.message,
        });
      }
    }).end(imageBuffer);
  } catch (error) {
    console.error("Vendor Add Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Vendors for the Logged-in User
const getAllVendors = async (req, res) => {
  try {
    const user = req.user.userId;
    const vendors = await prisma.vendor.findMany({ where: { builderId: user } });
    res.status(200).json({ success: true, totalVendors: vendors.length, vendors });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { upload, addVendor, getAllVendors };
