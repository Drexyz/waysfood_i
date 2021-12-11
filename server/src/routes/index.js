//import express and setup router
const express = require("express");
const router = express.Router();

//////////Get Controller & Middleware/////////
//Controller
const { addUsers, getUser, getUsers, user, profile,
        deleteUser, checkUser, editUser } = require('../controllers/user');
const { getProducts, getPartnerProducts, getProduct, 
        addProduct, editProduct, deleteProduct } = require('../controllers/product');
const { getTransactions, getTransaction, addtransaction, 
        editTransaction, deleteTransaction, getUserTransactions } = require('../controllers/transaction')

//Middleware
const { auth } = require('../middlewares/auth');
const { uploadFile } = require('../middlewares/uploadFile');
const { updateFile } = require('../middlewares/updateFile')

/////////////////Routes/////////////////////
//route user
router.post("/register", addUsers);
router.post("/login", getUser);
router.get("/users", getUsers);
router.delete("/user/:id", deleteUser);
router.get("/user", auth, checkUser);
router.patch("/user/:id", auth, updateFile('image'), editUser);
router.get('/user/:id', user);
router.get('/my-profile', auth, profile)

//route product
router.get("/products", getProducts);
router.get("/products/:id", getPartnerProducts);
router.get("/product/:id", getProduct);
router.post("/product", auth, uploadFile('image'), addProduct);
router.patch("/product/:id", auth, updateFile('image'), editProduct);
router.delete("/product/:id", auth, deleteProduct);

//route transaction
router.get("/transactions/:id", auth, getTransactions);
router.get("/transaction/:id", auth, getTransaction);
router.post("/transaction", auth, addtransaction);
router.patch("/transaction/:id", auth, editTransaction);
router.delete("/transaction/:id", auth, deleteTransaction);
router.get("/my-transactions", auth, getUserTransactions);


//export
module.exports = router;