const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateStaffToAdmin,
} = require("../controllers/authController");
const { validateToken, validatePasswordToken } = require("../middlewares/validateTokenHandler");
const router = express.Router();

router.post("/auth/:role", registerUser);
router.post("/auth/users/login", loginUser);
router.post("/admin/login", loginUser);
router.post("/auth/users/forgot-password", forgotPassword);
router.put("/auth/users/reset-password/:token", validatePasswordToken, resetPassword);

router.post("/admin/forgot-password", forgotPassword);
router.put(
  "/admin/reset-password/:token",
  validatePasswordToken,
  resetPassword
);
router.put("/admin/updateRole/:staffId", validateToken, updateStaffToAdmin);

module.exports = router;
