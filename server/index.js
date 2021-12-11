require('dotenv').config()
const cors = require('cors')
//import express
const express = require("express");
const app = express();

// import socket 
const http = require('http')
const {Server} = require('socket.io')

// Get routes to the variabel
const router = require("./src/routes");
//port
const port = 5000;

// add after app initialization
const server = http.createServer(app)
const io = new Server(server, {
 cors: {
   origin: 'http://localhost:3000' // define client origin if both client and server have different origin
 }
})
require('./src/socket')(io)

app.use(express.json());
app.use(cors())
app.use("/uploads", express.static("uploads"));
// Add endpoint grouping and router
app.use("/api/v1/", router);

//app.listen(port, () => console.log(`Listening on port ${port}!`));
server.listen(port, () => console.log(`Listening on port ${port}!`))