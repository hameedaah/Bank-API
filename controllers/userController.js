const json2csv = require("json2csv").parse;
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const authModel = require("../models/authModel");
const { transactionID, userUUID } = require("../services/uuid");
const { convertAmount } = require("../services/currency");

const createAccount = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const userEmail = req.user.email;
  const { currency } = req.body;
  if (userRole !== "user") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
    });
  }

  try {
    const userIdAndEmailExists = await authModel.checkIfIdAndEmailExists([
      userId,
      userEmail,
    ]);
    if (userIdAndEmailExists === 0) {
      return res.status(404).json({
        title: "User Not Found",
        message: "User does not exist.",
      });
    }
    const currencyExists = await adminModel.checkIfCurrencyExists(
      currency.toUpperCase()
    );
    if (currencyExists.length === 0) {
      return res.status(404).json({
        message: "Not Found",
        error: `The currency ${currency} does not exist in the database.`,
      });
    }

    const existingAccount = await userModel.findAccountByUserIdAndCurrency([
      userId,
      currency.toUpperCase(),
    ]);
    if (existingAccount.length > 0) {
      return res.status(409).json({
        message: "Conflict",
        error: `User already has an account in ${currency.toUpperCase()}.`,
      });
    }
    const account = await userModel.createAccount([
      userId,
      currency.toUpperCase(),
    ]);
    if (account.length > 0) {
      const userDetails = await userModel.findAccountByUserId(
        account[0].user_id
      );
      return res.status(201).json({
        message: "Account created successfully",
        data: {
          account: {
            account_number: account[0].account_number
              .toString()
              .padStart(10, "0"),
            account_balance: account[0].account_balance,
            currency: account[0].currency,
            created_at: account[0].created_at,
            updated_at: account[0].updated_at,
          },
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
      return res.status(500).json({
        message: "Internal Server Error",
        error: "Error creating account",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getUserAccounts = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  if (userRole !== "user") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
      return (
        res.status(404),
        json({
          message: "User has not created any accounts",
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

const getSpecificUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;

  if (userRole !== "user") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      const userDetails = await userModel.findAccountByUserId(
        specificUserAccount[0].user_id
      );
      return res.status(200).json({
        message: "User account fetched successfully",
        data: {
          account: {
            account_number: specificUserAccount[0].account_number
              .toString()
              .padStart(10, "0"),
            account_balance: specificUserAccount[0].account_balance,
            currency: specificUserAccount[0].currency,
            created_at: specificUserAccount[0].created_at,
            updated_at: specificUserAccount[0].updated_at,
          },
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
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const depositToUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;
  const amount = parseFloat(req.body.amount);

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      if (specificUserAccount[0].active === false) {
        return res.status(403).json({
          title: "Account Deactivated",
          message: "Unable to make deposit, account is deactivated",
        });
      }
      const transaction_id = await transactionID();
      const id = await userUUID();
      const createTransaction = await userModel.createTransaction(
        transaction_id
      );
      if (createTransaction) {
        const deposit = await userModel.makeDepositToUserAccount([
          id,
          amount,
          account_number,
          createTransaction[0].transaction_id,
        ]);
        const updateAmount = await userModel.addDepositToAccountBalance([
          amount,
          account_number,
        ]);
        if (updateAmount) {
          res.status(200).json({
            title: "Deposit Successful",
            message: `${amount} deposited successfully`,
          });
        }
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const withdrawFromUserAccount = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;
  const amount = parseFloat(req.body.amount);

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      if (specificUserAccount[0].active === false) {
        return res.status(403).json({
          title: "Account Deactivated",
          message: "Unable to make withdrawal, account is deactivated",
        });
      }
      if (specificUserAccount[0].account_balance < amount) {
        return res.status(400).json({
          title: "Insufficient Balance",
          message: "Insufficient funds.",
        });
      }
      const transaction_id = await transactionID();
      const id = await userUUID();
      const createTransaction = await userModel.createTransaction(
        transaction_id
      );
      if (createTransaction) {
        const withdrawal = await userModel.makeWithdrawalFromUserAccount([
          id,
          amount,
          account_number,
          createTransaction[0].transaction_id,
        ]);
        const updateAmount = await userModel.removeWithdrawalFromAccountBalance(
          [amount, account_number]
        );
        if (updateAmount) {
          res.status(200).json({
            title: "Withdrawal Successful",
            message: `${amount} withdrawn successfully`,
          });
        }
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getUserAccountTransactions = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      if (specificUserAccount[0].active === false) {
        return res.status(403).json({
          title: "Account Deactivated",
          message: "Unable to get transaction history, account is deactivated",
        })
      }
      const transactions = await userModel.getUserAccountTransactions(
        account_number
      )
      if (transactions.length > 0) {
        const updatedTransactions = transactions.map((transaction) => {
          const formattedTransaction = {
            transaction_id: transaction.transaction_id,
            account_number: transaction.account_number
              ? transaction.account_number.toString().padStart(10, "0")
              : transaction.source_account.toString().padStart(10, "0"),
            amount: transaction.amount,
            transaction_type: transaction.type,
            created_at: transaction.created_at,
          };

          if (transaction.type === "transfer") {
            formattedTransaction.destination_account =
              transaction.destination_account.toString().padStart(10, "0");
          }
          if (transaction.type === "bill") {
            formattedTransaction.bill_type = transaction.bill_type_name;
          }
          return formattedTransaction;
        })
        return res.status(200).json({
          message: "Transaction history fetched successfully",
          data: updatedTransactions,
        });
      } else {
        return res.status(404).json({
          message: "User has not carried out any transactions",
        });
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const downloadUserAccountTransactions = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      if (specificUserAccount[0].active === false) {
        return res.status(403).json({
          title: "Account Deactivated",
          message: "Unable to get transaction history, account is deactivated",
        });
      }
      const transactions = await userModel.getUserAccountTransactions(
        account_number
      );
      if (transactions.length > 0) {
       const updatedTransactions = transactions.map((transaction) => {
         const formattedTransaction = {
           transaction_id: transaction.transaction_id,
           account_number: transaction.account_number
             ? transaction.account_number.toString().padStart(10, "0")
             : transaction.source_account.toString().padStart(10, "0"),
           amount: transaction.amount,
           transaction_type: transaction.type,
           created_at: transaction.created_at,
         };

         if (transaction.type === "transfer") {
           formattedTransaction.destination_account =
             transaction.destination_account.toString().padStart(10, "0");
         }
         if (transaction.type === "bill") {
           formattedTransaction.bill_type = transaction.bill_type_name;
         }
         return formattedTransaction;
       });

        const csv = json2csv(updatedTransactions, { header: true });

        res.setHeader(
          "Content-Disposition",
          "attachment; filename=transaction-history.csv"
        );
        res.setHeader("Content-Type", "text/csv");
        res.status(200).end(csv);
      } else {
        return res.status(404).json({
          message: "User has not carried out any transactions",
        })
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const payUserBill = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const account_number = req.params.accountNumber;
  const amount = parseFloat(req.body.amount);
  const bill_type = req.body.type.toLowerCase();

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      account_number,
    ]);
    if (specificUserAccount.length > 0) {
      if (specificUserAccount[0].active === false) {
        return res.status(403).json({
          title: "Account Deactivated",
          message: "Unable to pay bills, account is deactivated",
        });
      }
      const checkIfBillTypeExists = await userModel.checkIfBillTypeExists(
        bill_type
      );
      if (checkIfBillTypeExists.length > 0) {
        if (specificUserAccount[0].account_balance < amount) {
          return res.status(400).json({
            title: "Insufficient Balance",
            message: "Insufficient funds.",
          });
        }
        const transaction_id = await transactionID();
        const id = await userUUID();
        const createTransaction = await userModel.createTransaction(
          transaction_id
        );
        if (createTransaction) {
          const bill = await userModel.payBillFromUserAccount([
            id,
            amount,
            account_number,
            bill_type,
            createTransaction[0].transaction_id,
          ]);
          const updateAmount =
            await userModel.removeBillPaymentFromAccountBalance([
              amount,
              account_number,
            ]);
          if (updateAmount) {
            res.status(200).json({
              title: "Bill Payment Successful",
              message: `${amount} for ${bill_type} paid successfully`,
            });
          }
        }
      } else {
        return res.status(404).json({
          title: "Not found",
          message: "Bill type not found",
        });
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
      });
    }
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const makeTransfer = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const source_account = req.params.accountNumber;
  const amount = parseFloat(req.body.amount);
  let destinationAmount = amount;
  const destination_account = req.body.destination_account;

  if (userRole === "superAdmin") {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to perform this action.",
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
    const specificUserAccount = await userModel.getSpecificUserAccount([
      userId,
      source_account,
    ]);

    const specificDestinationAccount =
      await userModel.findUserAccountByAccountNumber(destination_account);

    if (specificUserAccount.length > 0) {
      if (specificDestinationAccount.length > 0) {
        if (source_account === destination_account) {
          return res.status(400).json({
            title: "Self-Transfer",
            message:
              "You cannot transfer funds from your own account to your own account.",
          });
        }
        if (specificUserAccount[0].active === false) {
          return res.status(403).json({
            title: "Account Deactivated",
            message: "Unable to make transfer, source account is deactivated",
          });
        }
        if (specificDestinationAccount[0].active === false) {
          return res.status(403).json({
            title: "Account Deactivated",
            message:
              "Unable to make transfer, destination account is deactivated",
          });
        }
        if (specificUserAccount[0].account_balance < amount) {
          return res.status(400).json({
            title: "Insufficient Balance",
            message: "Insufficient funds.",
          });
        }

        if (
          specificUserAccount[0].type !== specificDestinationAccount[0].type
        ) {
          destinationAmount = await convertAmount(
            specificUserAccount[0].type,
            specificDestinationAccount[0].type,
            amount
          );
        }

        const transaction_id = await transactionID();
        const id = await userUUID();
        const createTransaction = await userModel.createTransaction(
          transaction_id
        );
        if (createTransaction) {
          const transfer = await userModel.transferFromUserAccount([
            id,
            amount,
            source_account,
            destination_account,
            createTransaction[0].transaction_id,
          ]);
          const updateSourceAccount =
            await userModel.removeWithdrawalFromAccountBalance([
              amount,
              source_account,
            ]);

          const updateDestinationAcount =
            await userModel.addDepositToAccountBalance([
              destinationAmount,
              destination_account,
            ]);
          if (updateSourceAccount && updateDestinationAcount) {
            res.status(200).json({
              title: "Transfer Successful",
              message: `${amount} transferred successfully`,
            });
          }
        }
      } else {
        return res.status(404).json({
          title: "Not found",
          message: "Destination account number not found",
        });
      }
    } else {
      return res.status(404).json({
        title: "Not found",
        message: "User account number not found",
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
  createAccount,
  getUserAccounts,
  getSpecificUserAccount,
  depositToUserAccount,
  withdrawFromUserAccount,
  getUserAccountTransactions,
  downloadUserAccountTransactions,
  payUserBill,
  makeTransfer,
};
