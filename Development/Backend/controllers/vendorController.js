const prisma = require("../utils/prisma.js");


const allVendors  = async(req,res)=>{
    try {
        const allVendors = await prisma.vendor.findMany();
        res.status(200).json({
            status: 200,
            data: allVendors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
        
    }
}

module.exports = {allVendors};