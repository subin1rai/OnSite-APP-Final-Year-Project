const prisma = require("../utils/prisma.js");

const getBudget = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch the project with its related budgets
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        budgets: {
          include:{
            Transaction: true
          }
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("Project with budgets:", project);
    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while fetching the project budget." });
  }
};

// add Transcation on budget 
const addTransaction = async (req, res) => {
  try {
    const { budgetId, vendorId, note, amount, type, category } = req.body;
    // Validate input
    if (!budgetId || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(budgetId) },
    });

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    // Calculate updated inHand amount
    let updatedInHand = budget.inHand || 0;
    if (type === "Credit") {
      updatedInHand += parseFloat(amount);
    } else if (type === "Debit") {
      updatedInHand -= parseFloat(amount);
    }

    // Update the budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: { inHand: updatedInHand },
    });

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        budgetId: budget.id,
        vendorId: vendorId ? parseInt(vendorId) : null,
        amount: parseFloat(amount),
        type,
        note,
        category
      },
    });

    console.log("Transaction added successfully:", transaction);
    return res.status(200).json({
      message: "Transaction added successfully",
      transaction,
      updatedBudget,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({ error: "An error occurred while processing the transaction." });
  }
};

const allTransaction = async (req, res) => {
  try {
    const {budgetId} = req.body;
    console.log(budgetId);
    const transactions = await prisma.budget.findFirst({
      where:{
        id:parseInt(budgetId),
      },
      include: {
        Transaction: {
          include:{
            vendor:{
              select:{
                VendorName: true,
                contact:true
              }
            }
          }
        }
      },
    });
    
    console.log("All transactions:", transactions);
    return res.status(200).json({ message: "All transactions", transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!"});
  }
} 

module.exports = {
  getBudget,
  addTransaction,
  allTransaction
};
