const prisma = require("../utils/prisma.js");

const getProjectTrialBalance = async (req, res) => {
  try {
    const builderId = req.user.userId;

    // Get all projects for the builder
    const projects = await prisma.project.findMany({
      where: { builderId },
      include: { budgets: true }
    });

    const projectIds = projects.map(project => project.id);

    const budgets = await prisma.budget.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        Transaction: true,
        project: {
          select: {
            projectName: true,
            status: true
          }
        }
      }
    });

    if (!budgets || budgets.length === 0) {
      return res.status(200).json({
        message: "No budgets found for the builder's projects.",
        summary: {},
        transactionsByCategory: [],
        transactionsByMonth: [],
        transactions: [],
        projects: projects.map(project => ({
          id: project.id,
          name: project.projectName,
          status: project.status,
          budget: 0
        }))
      });
    }

    // Summary variables
    let totalBudget = 0;
    let totalInHand = 0;
    let totalExpenses = 0;
    let totalIncome = 0;
    const transactionsByCategory = {};
    const transactionsByMonth = {};
    const transactions = [];

    // Process budget and transaction data
    budgets.forEach(budget => {
      totalBudget += budget.amount || 0;
      totalInHand += budget.inHand || 0;

      budget.Transaction.forEach(transaction => {
        const transactionData = {
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type || 'Debit',
          category: transaction.category || 'Uncategorized',
          note: transaction.note,
          createdAt: transaction.createdAt,
          projectId: budget.projectId,
          projectName: budget.project.projectName,
          budgetId: budget.id
        };

        transactions.push(transactionData);

        // Transactions by Category
        if (!transactionsByCategory[transaction.category]) {
          transactionsByCategory[transaction.category] = {
            category: transaction.category,
            expense: 0,
            income: 0
          };
        }

        if (transaction.type.toLowerCase() === 'credit') {
          transactionsByCategory[transaction.category].income += transaction.amount;
          totalIncome += transaction.amount;
        } else {
          transactionsByCategory[transaction.category].expense += transaction.amount;
          totalExpenses += transaction.amount;
        }

        // Transactions by Month
        const date = new Date(transaction.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${month} ${year}`;

        if (!transactionsByMonth[monthKey]) {
          transactionsByMonth[monthKey] = {
            month: monthKey,
            expense: 0,
            income: 0
          };
        }

        if (transaction.type.toLowerCase() === 'credit') {
          transactionsByMonth[monthKey].income += transaction.amount;
        } else {
          transactionsByMonth[monthKey].expense += transaction.amount;
        }
      });
    });

    // Sort transactions by date (most recent first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate balances
    const netBalance = totalIncome - totalExpenses;
    const budgetBalance = totalBudget - totalExpenses;

    return res.status(200).json({
      summary: {
        totalBudget,
        totalInHand,
        totalExpenses,
        totalIncome,
        netBalance,
        budgetBalance
      },
      transactionsByCategory: Object.values(transactionsByCategory),
      transactionsByMonth: Object.values(transactionsByMonth).sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }

        return months.indexOf(aMonth) - months.indexOf(bMonth);
      }),
      transactions: transactions.slice(0, 20), 
      projects: projects.map(project => ({
        id: project.id,
        name: project.projectName,
        status: project.status,
        budget: project.budgets.reduce((total, budget) => total + budget.amount, 0)
      }))
    });
  } catch (error) {
    console.error("Error in getProjectTrialBalance:", error);
    return res.status(500).json({ error: "Failed to fetch trial balance data" });
  }
};

module.exports = { getProjectTrialBalance };
