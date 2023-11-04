const express = require("express");
const { createAccount, getUserAccounts, getSpecificUserAccount, depositToUserAccount, withdrawFromUserAccount, getUserAccountTransactions, downloadUserAccountTransactions, payUserBill, makeTransfer } = require("../controllers/userController");
const { validateToken } = require("../middlewares/validateTokenHandler");
const router = express.Router();

router.use(validateToken);
router.post("/users/accounts", createAccount);
router.get("/users/accounts", getUserAccounts);
router.get("/users/accounts/:accountNumber", getSpecificUserAccount);
router.post("/users/accounts/:accountNumber/deposits", depositToUserAccount);
router.post("/users/accounts/:accountNumber/withdrawals", withdrawFromUserAccount);
router.get("/users/accounts/:accountNumber/transactions", getUserAccountTransactions);
router.get("/users/accounts/:accountNumber/transactions/download", downloadUserAccountTransactions);
router.post(
  "/users/accounts/:accountNumber/bills",
  payUserBill
);
router.post("/users/accounts/:accountNumber/transfer", makeTransfer);


module.exports = router;