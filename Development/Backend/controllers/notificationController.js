const axios = require('axios');
const prisma = require('../utils/prisma.js');

const notificationService = async (subID, title, message) => {
  try {
      const response = await axios.post('https://app.nativenotify.com/api/notification', {
          subID: subID.toString(),
          appId: 28966,
          appToken: 'O50kS3CBDq8CYkr3yCKdB7',
          title: title,
          body: message
        });
        
        console.log(subID, title, message);
    console.log('Notification sent successfully:', response.status);
  } catch (error) {
    console.error('❌ Failed to send notification:', error.response?.data || error.message);
  }
};


const getNoficitation = async (req, res) => {
  try {
    const userId  = req.user.userId;
    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId),
      },
    });
    return res.status(200).json({ message: "All notifications", notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    await prisma.notification.delete({
      where: {
        id: parseInt(id),
      },
    });
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = { notificationService, getNoficitation , deleteNotification };