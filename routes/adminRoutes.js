const express = require("express");
const {
  createCurrency,
  getAllCurrencies,
  getAllUserAccounts,
  getSpecificUserAccount,
  getAllUserAccountsWithSameCurrency,
    deactivateUserAccount,
  reactivateUserAccount,
} = require("../controllers/adminContoller");
const { validateToken } = require("../middlewares/validateTokenHandler");
const router = express.Router();

router.use(validateToken);
router.post("/admin/currency", createCurrency);
router.get("/admin/currency", getAllCurrencies);
router.get("/admin/accounts", getAllUserAccounts);
router.get("/admin/accounts/:currency", getAllUserAccountsWithSameCurrency);
router.get("/admin/accounts/:userId", getSpecificUserAccount);
router.put("/admin/accounts/deactivate/:accountNumber", deactivateUserAccount);
router.put("/admin/accounts/reactivate/:accountNumber", reactivateUserAccount);

module.exports = router;
