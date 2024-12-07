const prisma = require("../utils/prisma.js");

const getBudget = async (req, res) => {
  try {
    const { id } = req.params; // Extract the project ID from the request parameters
    console.log(id);

    // Fetch the project with its related budgets
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        budgets: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("Project with budgets:", project);
    return res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while fetching the project budget." });
  }
};

module.exports = {
  getBudget,
};
