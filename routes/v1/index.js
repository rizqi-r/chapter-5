const router = require("express").Router();
const userController = require("../../controllers/v1/userControllers");
const accountController = require("../../controllers/v1/accountControllers");
const transactionController = require("../../controllers/v1/transactionControllers");
const authController = require("../../controllers/v1/authControllers");
const { restrict } = require("../../middlewares/restrict");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/whoami", restrict, authController.whoami);

router.get("/users", userController.getUser);
router.get("/users/:id", userController.getSpecificUser);
router.post("/users", userController.createUser);

router.get("/accounts", accountController.getAccount);
router.get("/accounts/:id", accountController.getSpecificAccount);
router.post("/accounts", accountController.createAccount);

router.get("/transactions", transactionController.getTransaction);
router.get("/transactions/:id", transactionController.getSpecificTransaction);
router.post("/transactions", transactionController.createTransaction);

module.exports = router;
