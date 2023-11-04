const pool = require("../config/db");
const queries = require("../sql/adminQueries");

const checkIfCurrencyExists = async (type) => {
  try {
    const { rows } = await pool.query(queries.checkIfCurrencyExists, [type]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const createCurrency = async (type) => {
  try {
    const { rows } = await pool.query(queries.createCurrency, [type]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getAllCurrencies = async () => {
  try {
    const { rows } = await pool.query(queries.getAllCurrencies);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getAllUserAccounts = async () => {
  try {
    const { rows } = await pool.query(queries.getAllUserAccounts);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const getAllUserAccountsWithSameCurrency = async (currency) => {
  try {
    const { rows } = await pool.query(queries.getAllUserAccountsWithSameCurrency, [currency]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const deactivateUserAccount = async (accountNumber) => {
   try {
     const { rows } = await pool.query(
       queries.deactivateUserAccount,
       [accountNumber]
     );
     return rows;
   } catch (err) {
     console.error(err.message);
     throw new Error(err.message);
   }
}

const reactivateUserAccount = async (accountNumber) => {
  try {
    const { rows } = await pool.query(queries.reactivateUserAccount, [
      accountNumber,
    ]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

module.exports = { checkIfCurrencyExists, createCurrency, getAllCurrencies, getAllUserAccounts, getAllUserAccountsWithSameCurrency, deactivateUserAccount, reactivateUserAccount };