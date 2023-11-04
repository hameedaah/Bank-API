const createCurrency = "INSERT INTO currencies (type) VALUES ($1) RETURNING *";
const checkIfCurrencyExists = "SELECT * FROM currencies WHERE type = $1";
const getAllCurrencies = "SELECT * FROM currencies";
const getAllUserAccounts = "SELECT accounts.*, currencies.type AS currency FROM accounts JOIN currencies ON accounts.currency_id = currencies.id";
const getAllUserAccountsWithSameCurrency = `SELECT accounts.*, currencies.type AS currency
FROM accounts
JOIN currencies ON accounts.currency_id = currencies.id
WHERE currencies.type = $1`;
const deactivateUserAccount = 
`UPDATE accounts
SET active = false
FROM currencies
WHERE accounts.currency_id = currencies.id
  AND accounts.account_number = $1
RETURNING accounts.*, currencies.type AS currency_name`;

const reactivateUserAccount = `UPDATE accounts
SET active = true
FROM currencies
WHERE accounts.currency_id = currencies.id
  AND accounts.account_number = $1
RETURNING accounts.*, currencies.type AS currency_name`;

module.exports = {
    createCurrency,
    checkIfCurrencyExists,
    getAllCurrencies,
    getAllUserAccounts,
    getAllUserAccountsWithSameCurrency,
    deactivateUserAccount,
    reactivateUserAccount
};
