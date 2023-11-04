const { getCurrencies } = require("../services/currency");
const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const emailService = require("../services/email");


const createCurrency = async (req, res) => {
  const userRole = req.user.role;
  const { type } = req.body;
  const availableCurrencies = await getCurrencies();
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }
  if (availableCurrencies.hasOwnProperty(type.toUpperCase())) {
    try {
      const currencyExists = await adminModel.checkIfCurrencyExists(
        type.toUpperCase()
      );

      if (currencyExists.length > 0) {
        return res.status(400).json({
          message: "Bad Request",
          error: "Currency already exists.",
        });
      }

      const currency = await adminModel.createCurrency(type.toUpperCase());
      if (currency.length > 0) {
        return res.status(201).json({
          message: `Currency ${currency[0].type} has been added successfully.`,
        });
      } else {
        return res.status(500).json({
          message: "Internal Server Error",
          error: "Error adding currency.",
        });
      }
    } catch (error) {
      console.log(error?.message);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  } else {
    return res.status(400).json({
      message: "Bad Request",
      error:
        "Currency type is not supported. Please enter a valid currency type",
    });
  }
};

const getAllCurrencies = async (req, res) => {
  const userRole = req.user.role;
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }
  try {
    const currencies = await adminModel.getAllCurrencies();
    if (currencies.length > 0) {
      res.status(200).json({
        message: "Currencies retrieved successfully",
        data: currencies,
      });
    } else {
      return res.status(200).json({
        message: "No currencies have been added yet.",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getAllUserAccounts = async (req, res) => {
  const userRole = req.user.role;
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }

  try {
    const allUserAccounts = await adminModel.getAllUserAccounts();
    if (allUserAccounts.length > 0) {
      const updatedAccountsPromises = allUserAccounts.map(async (account) => {
        const userDetails = await userModel.findAccountByUserId(
          account.user_id
        );
        return {
          account: {
            account_number: account.account_number,
            account_balance: account.account_balance,
            currency: account.currency,
            created_at: account.created_at,
            updated_at: account.updated_at,
          },
          user: {
            _id: userDetails[0].id.replace(/-/g, ""),
            username: userDetails[0].username,
            email: userDetails[0].email,
            role: userDetails[0].role_name,
            created_at: userDetails[0].created_at,
            updated_at: userDetails[0].updated_at,
          },
        };
      });

      const updatedAccounts = await Promise.all(updatedAccountsPromises);
      return res.status(200).json({
        message: "User accounts fetched successfully",
        data: updatedAccounts,
      });
    } else {
      return (
        res.status(404),
        json({
          message: "No accounts have been created",
        })
      );
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getAllUserAccountsWithSameCurrency = async (req, res) => {
  const userRole = req.user.role;
  const currency = req.params.currency;
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }

  try {
    const currencyExists = await adminModel.checkIfCurrencyExists(
      currency.toUpperCase()
    );
    if (currencyExists.length === 0) {
      return res.status(404).json({
        message: "Not found",
        error: "Currency not found.",
      });
    }
    const allUserAccountsWithSameCurrency =
      await adminModel.getAllUserAccountsWithSameCurrency(
        currency.toUpperCase()
      );
    if (allUserAccountsWithSameCurrency.length > 0) {
      const updatedAccountsPromises = allUserAccountsWithSameCurrency.map(
        async (account) => {
          const userDetails = await userModel.findAccountByUserId(
            account.user_id
          );
          return {
            account: {
              account_number: account.account_number,
              account_balance: account.account_balance,
              currency: account.currency,
              created_at: account.created_at,
              updated_at: account.updated_at,
            },
            user: {
              _id: userDetails[0].id.replace(/-/g, ""),
              username: userDetails[0].username,
              email: userDetails[0].email,
              role: userDetails[0].role_name,
              created_at: userDetails[0].created_at,
              updated_at: userDetails[0].updated_at,
            },
          };
        }
      );

      const updatedAccounts = await Promise.all(updatedAccountsPromises);
      return res.status(200).json({
        message: "User accounts fetched successfully",
        data: updatedAccounts,
      });
    } else {
      return (
        res.status(404),
        json({
          message: "No accounts have been created",
        })
      );
    }
    v;
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getSpecificUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.params.userId;
  if (userRole !== "admin") {
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

  if (!isUUID(userId)) {
    return res.status(400).json({
      message: "Bad Request",
      error: "Invalid id format",
    });
  }

  try {
    const userExists = await userModel.findAccountByUserId(userId);
    if (userExists.length === 0) {
      return res.status(404).json({
        title: "User Not Found",
        message: "User does not exist.",
      });
    }
    if (userExists[0].role_name !== "user") {
      return res.status(403).json({
        title: "Forbidden",
        message: "Invalid id. Only users are allowed to have accounts.",
      });
    }
    const userAccounts = await userModel.getUserAccounts(userId);
    if (userAccounts.length > 0) {
      const userDetails = await userModel.findAccountByUserId(
        userAccounts[0].user_id
      );
      const updatedAccounts = userAccounts.map((account) => ({
        account_number: account.account_number,
        account_balance: account.account_balance,
        currency: account.currency,
        created_at: account.created_at,
        updated_at: account.updated_at,
      }));
      return res.status(200).json({
        message: "User accounts fetched successfully",
        data: {
          accounts: updatedAccounts,
          user: {
            _id: userDetails[0].id.replace(/-/g, ""),
            username: userDetails[0].username,
            email: userDetails[0].email,
            role: userDetails[0].role_name,
            created_at: userDetails[0].created_at,
            updated_at: userDetails[0].updated_at,
          },
        },
      });
    } else {
      return res.status(404).json({
        message: "User has not created any accounts",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const deactivateUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const account_number = req.params.accountNumber;
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }
  try {
    const account = await userModel.findUserAccountByAccountNumber(
      account_number
    );
    if (account.length === 0) {
      return res.status(404).json({
        title: "Not Found",
        message: "Account Number does not exist.",
      });
    }
    if (account[0].active === false) {
      return res.status(403).json({
        message: "Forbidden",
        error: "Account has already been deactivated.",
      });
    }
    const deactivateAccount = await adminModel.deactivateUserAccount(
      account_number
    );
    if (deactivateAccount) {
      const userDetails = await userModel.findAccountByUserId(
        deactivateAccount[0].user_id
      );
      await emailService(
        userDetails[0].email,
        "Account Deactivation Notification",
        `Dear ${userDetails[0].username},\n\nWe regret to inform you that your ${deactivateAccount[0].currency_name} account has been deactivated. If you believe this is an error or have any questions, please contact our support team.\n\nBest regards.`
      );
      return res.status(200).json({
        message: "Account successfully deactivated.",
      });
    } else {
      return res.status(500).json({
        message: "Internal Server Erro",
        error: "Error deactivating account. Please try again later",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const reactivateUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const account_number = req.params.accountNumber;
  if (userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }
  try {
    const account = await userModel.findUserAccountByAccountNumber(
      account_number
    );
    if (account.length === 0) {
      return res.status(404).json({
        title: "Not Found",
        message: "Account Number does not exist.",
      });
    }
    if (account[0].active === true) {
      return res.status(403).json({
        message: "Forbidden",
        error: "Account is already active.",
      });
    }
    const reactivateAccount = await adminModel.reactivateUserAccount(
      account_number
    );
    if (reactivateAccount) {
      const userDetails = await userModel.findAccountByUserId(
        reactivateAccount[0].user_id
      );
      await emailService(
        userDetails[0].email,
        "Account Reactivation Notification",
        `Dear ${userDetails[0].username},\n\nWe are pleased to inform you that your ${reactivateAccount[0].currency_name}  account has been successfully reactivated. You can now access and enjoy our platform as before.\n\nIf you have any questions or need further assistance, please feel free to contact our support team.\n\nBest regards.`
      );

      return res.status(200).json({
        message: "Account successfully reactivated.",
      });
    } else {
      return res.status(500).json({
        message: "Internal Server Erro",
        error: "Error reactivating account. Please try again later",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCurrency,
  getAllCurrencies,
  getAllUserAccounts,
  getAllUserAccountsWithSameCurrency,
  getSpecificUserAccount,
  deactivateUserAccount,
  reactivateUserAccount,
};
