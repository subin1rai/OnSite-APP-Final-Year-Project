const http = require("http");
const { initializeSocket } = require('./controllers/socketController');
require("dotenv").config()
const routes = require("./routes/routes");
const express = require("express");

const app = express();
const server = http.createServer(app);
initializeSocket(server);


app.use(express.json());
app.use("/api", routes);


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
