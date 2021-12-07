require('dotenv').config()
const cors = require('cors')
//import express
const express = require("express");
const app = express();

// Get routes to the variabel
const router = require("./src/routes");
//port
const port = 5000;

app.use(express.json());
app.use(cors())
app.use("/uploads", express.static("uploads"));
// Add endpoint grouping and router
app.use("/api/v1/", router);

app.listen(port, () => console.log(`Listening on port ${port}!`));