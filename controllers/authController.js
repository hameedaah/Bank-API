const authModel = require("../models/authModel");
const hash = require("../services/hash");
const jwt = require("../services/jwt");
const { userUUID } = require("../services/uuid");
const emailService = require("../services/email");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const { role } = req.params;
  if (!username || !email || !password || !role) {
    return res.status(400).json({
      title: "Bad Request",
      message: "All fields are required",
    });
  }
  try {
    const userAvailable = await authModel.checkIfEmailExists(email);
    const hashedPassword = await hash.hashing(password);
    if (role === "user" || role === "staff") {
      if (userAvailable.length > 0) {
        return res.status(400).json({
          title: "Validation Error",
          message: "User already exists",
        });
      }
      const id = await userUUID();
      const user = await authModel.registerUser([
        username,
        email,
        hashedPassword,
        role,
        id,
      ]);

      if (user.length > 0) {
        await emailService(
          email,
          "Welcome",
          `Dear ${user[0].username},\n\nCongratulations on your successful registration as a ${user[0].role_name}! You're all set to explore our platform.\n\nBest regards.`
        );
        res.status(201).json({
          message: "Registration successful",
          data: {
            _id: user[0].id.replace(/-/g, ""),
            username: user[0].username,
            email: user[0].email,
            role: user[0].role_name,
            created_at: user[0].created_at,
            updated_at: user[0].updated_at,
          },
        });
      } else {
        return res.status(400).json({
          title: "Validation Error",
          message: "User data is not valid",
        });
      }
    } else {
      return res.status(400).json({
        title: "Bad Request",
        message: "Role must be one of the following values: [user, staff]",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      title: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      title: "Bad Request",
      message: "All fields are required",
    });
  }
  try {
    const userExists = await authModel.checkIfEmailExists(email);
    if (userExists.length > 0) {
      const isPasswordValid = await hash.comparePasswords(
        password,
        userExists[0].password
      );
      if (isPasswordValid) {
        const token = await jwt.generateToken({
          user: {
            _id: userExists[0].id.replace(/-/g, ""),
            username: userExists[0].username,
            email: userExists[0].email,
            role: userExists[0].role_name,
          },
        });
        res.cookie("jwt", token, { maxAge: 20 * 60 * 1000, httpOnly: true });
        return res.status(200).json({
          message: "Login Successful",
          data: {
            _id: userExists[0].id.replace(/-/g, ""),
            username: userExists[0].username,
            email: userExists[0].email,
            role: userExists[0].role_name,
            created_at: userExists[0].created_at,
            updated_at: userExists[0].updated_at,
          },
          token: token,
        });
      } else {
        return res.status(401).json({
          title: "Unauthorized",
          message: "Invalid email or password",
        });
      }
    } else {
      return res
        .status(401)
        .json({ title: "Unauthorized", message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      title: "Internal Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      title: "Bad Request",
      message: "Email is required",
    });
  }
  try {
    const user = await authModel.checkIfEmailExists(email);
    if (user.length > 0) {
      if (user[0].role_name === "superAdmin") {
        return res.status(400).json({
          title: "Validation Error",
          message:
            "Super Admin cannot change their password. Please contact the system administrators for assistance.",
        });
      }
      const token = await jwt.generateToken({
        user: {
          _id: user[0].id.replace(/-/g, ""),
          username: user[0].username,
          email: user[0].email,
          role: user[0].role_name,
        },
      }, "5m");
      await emailService(
        email,
        "Password Reset",
        `Dear ${user[0].username},\n\nClick on the link below to reset your password\n\nhttps://example.com/reset-password?token=${token}\n\nPlease note that the token is only valid for 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nBest Regards`
      );
      return res.status(200).json({
        message: "Password reset email sent",
        email: user[0].email,
      });
    } else {
      return res.status(400).json({
        title: "Validation Error",
        message: `User with email ${email} does not exist`,
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      title: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const tokenData = req.user;
  if (!password) {
    return res.status(400).json({
      title: "Bad Request",
      message: "Password is required",
    });
  }
  if (tokenData.role === "superAdmin") {
    return res.status(400).json({
      title: "Validation Error",
      message:
        "Super Admin cannot change their password. Please contact the system administrators for assistance.",
    });
  }
  try {
    const userExists = await authModel.checkIfIdAndEmailExists([tokenData._id ,tokenData.email]);
    const hashedPassword = await hash.hashing(password);
    if (userExists.length === 0) {
      return res.status(404).json({
        title: "User Not Found",
        message: "User does not exist.",
      });
    }
    const reset = await authModel.resetPassword([
      hashedPassword,
      tokenData.email,
    ]);
    if (reset) {
      return res.status(200).json({
        title: "Password Reset",
        message: "Your password has been reset successfully.",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateStaffToAdmin = async (req, res) => {
  const userRole = req.user.role;
  const staffId = req.params.staffId;

  if (userRole !== "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }

  const isUUID = (id) => {
    const uuidPattern =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

    return uuidPattern.test(id);
  };

  if (!isUUID(staffId)) {
    return res.status(400).json({
      message: "Bad Request",
      error: "Invalid id format",
    });
  }

  try {
    const staffExists = await authModel.checkIfStaffExists(staffId);
    if (staffExists.length === 0) {
      return res.status(404).json({
        message: "Not Found",
        error: "The staff does not exist.",
      });
    }
    const updatedResult = await authModel.updateStaffToAdmin(staffId);
    if (updatedResult) {
      await emailService(
        updatedResult[0].email,
        "You are now an Admin!",
        `Dear ${updatedResult[0].username},\n\nYou have been updated to an admin role.\n\nBest regards.`
      );
      return res
        .status(200)
        .json({ message: "Staff has been updated to admin" });
    } else {
      return res.status(500).json({
        message: "Internal Server Error",
        error:
          "An error occurred while updating the staff to admin. Please try again later.",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateStaffToAdmin,
};
