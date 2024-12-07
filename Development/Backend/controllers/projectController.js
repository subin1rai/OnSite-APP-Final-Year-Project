// Import Prisma client
const prisma = require("../utils/prisma.js");

// Controller to create a new project
const createProject = async (req, res) => {
 try {
     // Extract project details from request body
     const { projectName, ownerName, budgetAmount } = req.body;
   
     // Validate that all required fields are present
     if (!projectName || !ownerName || !budgetAmount) {
       return res.status(400).json({ message: "All fields are required" });
     }
   
     // Check if project with same name already exists
     const project = await prisma.project.findFirst({
       where: {
         projectName: projectName
       }
     });
   
     // Return error if project exists
     if (project) {
       return res.status(400).json({ "message": "Project already exists!" });
     }
   
     // Find owner by username
     const owner = await prisma.user.findFirst({
       where: {
         username: ownerName
       }
     });
   
     // Return error if owner not found
     if (!owner) {
       return res.status(400).json({ "message": "Owner not found!" });
     }
   
     // Create project and budget in a transaction
     const result = await prisma.$transaction(async (prisma) => {
       // Create new project in database
       const newProject = await prisma.project.create({
         data: {
           projectName,
           ownerName: owner.username,
           builderId: req.user.userId // Get builder ID from authenticated user
         }
       });
   
       // Create initial budget for the project
       const newBudget = await prisma.budget.create({
         data: {
           amount: budgetAmount,
           projectId: newProject.id
         }
       });
   
       return { newProject, newBudget };
     });
   
     return res.status(201).json({
       message: "Project created successfully",
       result
     });
 } catch (error) {
    console.log(error);
    return res.status(500).json({  
        message: "Internal server error",
        error: error.message
    }); 
 }
};

module.exports = {
  createProject
};