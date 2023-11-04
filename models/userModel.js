const pool = require("../config/db");
const queries = require("../sql/userQueries");

const findAccountByUserId = async (id) => {
  try {
    const { rows } = await pool.query(queries.findAccountByUserId, [id]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const findAccountByUserIdAndCurrency = async (payload) => {
  try {
    const { rows } = await pool.query(
      queries.findAccountByUserIdAndCurrency,
      payload
    );
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const findUserAccountByAccountNumber = async (accountNumber) => {
  try {
    const { rows } = await pool.query(queries.findUserAccountByAccountNumber, [
      accountNumber,
    ]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const createAccount = async (payload) => {
  try {
    const { rows } = await pool.query(queries.createAccount, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getUserAccounts = async (userId) => {
  try {
    const { rows } = await pool.query(queries.getUserAccounts, [userId]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getSpecificUserAccount = async (payload) => {
  try {
    const { rows } = await pool.query(queries.getSpecificUserAccount, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const makeDepositToUserAccount = async (payload) => {
  try {
    const { rows } = await pool.query(queries.makeDepositToUserAccount, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const makeWithdrawalFromUserAccount = async (payload) => {
  try {
    const { rows } = await pool.query(
      queries.makeWithdrawalFromUserAccount,
      payload
    );
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const payBillFromUserAccount = async (payload) => {
  try {
    const { rows } = await pool.query(
      queries.payBillFromUserAccount,
      payload
    );
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const transferFromUserAccount = async (payload) => {
  try {
    const { rows } = await pool.query(queries.makeTransferFromUserAccount, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const createTransaction = async (transaction_id) => {
  try {
    const { rows } = await pool.query(queries.createTransaction, [transaction_id]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const addDepositToAccountBalance = async (payload) => {
  try {
    const { rows } = await pool.query(queries.addDepositToAccountBalance, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const removeWithdrawalFromAccountBalance = async (payload) => {
  try {
    const { rows } = await pool.query(
      queries.removeWithdrawalFromAccountBalance,
      payload
    );
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const removeBillPaymentFromAccountBalance = async (payload) => {
  try {
    const { rows } = await pool.query(
      queries.removeBillPaymentFromAccountBalance,
      payload
    );
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getUserAccountTransactions = async (accountNumber) => {
  try {
    const { rows } = await pool.query(queries.getUserAccountTransactions, [
      accountNumber,
    ]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const checkIfBillTypeExists = async (type) => {
  try {
    const { rows } = await pool.query(queries.checkIfBillTypeExists, [
      type,
    ]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  createAccount,
  findAccountByUserId,
  findAccountByUserIdAndCurrency,
  findUserAccountByAccountNumber,
  getUserAccounts,
  getSpecificUserAccount,
  makeDepositToUserAccount,
  createTransaction,
  addDepositToAccountBalance,
  makeWithdrawalFromUserAccount,
  removeWithdrawalFromAccountBalance,
  getUserAccountTransactions,
  checkIfBillTypeExists,
  payBillFromUserAccount,
  removeBillPaymentFromAccountBalance,
  transferFromUserAccount,
};
