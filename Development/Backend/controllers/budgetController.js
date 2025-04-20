const prisma = require("../utils/prisma.js");
const { notificationService } = require("./notificationController.js");

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
          include: {
            Transaction: true,
          },
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
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the project budget." });
  }
};

// add Transcation on budget
const addTransaction = async (req, res) => {
  const { budgetId, vendorId, note, amount, type, category } = req.body;
  const userId = req.user.userId;
  console.log(userId);
  if (!budgetId || !amount || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch budget
      const budget = await tx.budget.findUnique({
        where: { id: parseInt(budgetId) },
      });

      if (!budget) {
        throw new Error("Budget not found");
      }

      // 2. Update in-hand based on transaction type
      let updatedInHand = budget.inHand || 0;
      const numericAmount = parseFloat(amount);

      if (type === "Credit") {
        updatedInHand += numericAmount;
      } else if (type === "Debit") {
        updatedInHand -= numericAmount;
      }

      const updatedBudget = await tx.budget.update({
        where: { id: budget.id },
        data: { inHand: updatedInHand },
      });

      // 3. Create transaction
      const transaction = await tx.transaction.create({
        data: {
          budgetId: budget.id,
          vendorId: vendorId ? parseInt(vendorId) : null,
          amount: numericAmount,
          type,
          note,
          category,
        },
      });

      const message = `A new transaction of amount ${numericAmount} has been added as a ${type.toLowerCase()}.`;

      const notification = await tx.notification.create({
        data: {
          userId: req.user.userId,
          message,
        },
      });
      notificationService(req.user.userId, "OnSite", message);
      return {
        transaction,
        updatedBudget,
        notification,
      };
    });

    return res.status(200).json({
      message: "Transaction added successfully",
      ...result,
    });
  } catch (error) {
    console.error(" Transaction failed:", error);
    return res.status(500).json({
      error: "An error occurred while processing the transaction.",
    });
  }
};

const allTransaction = async (req, res) => {
  try {
    const { budgetId } = req.body;
    console.log(budgetId);
    const transactions = await prisma.budget.findFirst({
      where: {
        id: parseInt(budgetId),
      },
      include: {
        Transaction: {
          include: {
            vendor: {
              select: {
                VendorName: true,
                contact: true,
              },
            },
          },
        },
      },
    });

    console.log("All transactions:", transactions);
    return res.status(200).json({ message: "All transactions", transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const vendorAmount = async (req, res) => {
  const { id } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        budgets: {
          include: {
            Transaction: {
              include: {
                vendor: true, 
              },
            },
          },
        },
      },
    });

    if (
      !project ||
      !project.budgets.length ||
      !project.budgets[0].Transaction 
    ) {
      return res.status(404).json({ message: "Vendor or transaction not found" });
    }

    const vendor = project.budgets[0].Transaction[0].vendor;

    const totalAmount = await prisma.transaction.aggregate({
      where: {
        vendorId: vendor.id,
      },
      _sum: {
        amount: true,
      },
    });

    return res.status(200).json({
      vendor: {
        id: vendor.id,
        name: vendor.VendorName,
        email: vendor.email,
        phone: vendor.phone
      },
      totalAmount: totalAmount._sum.amount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while fetching vendor details.",
    });
  }
};



module.exports = {
  getBudget,
  addTransaction,
  allTransaction,
  vendorAmount
};
