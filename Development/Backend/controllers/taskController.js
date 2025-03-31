const prisma = require("../utils/prisma.js");

const addTask = async (req, res) => {
    try {
      const { name, description, projectId, status } = req.body;
  
      const existingProject = await prisma.project.findFirst({
        where: {
          id: parseInt(projectId)
        }
      });
  
      if (!existingProject) {
        return res.status(404).json({ error: "Project not found!" });
      }
  
      const task = await prisma.task.create({
        data: {
          name,
          description,
          projectid: existingProject.id,
          status,
          isVisible: true
        }
      });
  
      return res.status(201).json({ task, message: "Task created successfully!" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };


  const getTask = async (req, res) => {
    try {
        const {projectId} = req.body;
        const existingProject = await prisma.project.findFirst({
            where: {
              id: parseInt(projectId)
            }
          });
      
          if (!existingProject) {
            return res.status(404).json({ error: "Project not found!" });
          }
      
      const tasks = await prisma.task.findMany({
        where:{
         projectid: projectId,
         isVisible:true
        }
      });

      return res.status(200).json( tasks );
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  const updateTask = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;
  
      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          status,
        },
      });
  
      return res.status(200).json({ task: updatedTask, message: "Task updated successfully!" });
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

  const deleteTask = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          isVisible: false,
        },
      });
  
      return res.status(200).json({ message: "Task deleted successfully!" });
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

  
module.exports = {
    addTask,
    getTask,
    updateTask,
    deleteTask
}