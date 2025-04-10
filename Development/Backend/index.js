const http = require("http");
const { initializeSocket } = require('./controllers/socketController');
require("dotenv").config();
const app = require('./app'); 

const server = http.createServer(app);
initializeSocket(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
