const createAccount =
  "INSERT INTO accounts (user_id, currency_id) VALUES ($1, (SELECT id FROM currencies WHERE type = $2)) RETURNING accounts.*, (SELECT type FROM currencies WHERE type = $2) AS currency";
const findAccountByUserId = `SELECT users.*, roles.role AS role_name
FROM users
INNER JOIN roles ON users.role_id = roles.id
WHERE users.id = $1;
`;
const findAccountByUserIdAndCurrency =
  "SELECT * FROM accounts WHERE user_id = $1 AND currency_id = (SELECT id FROM currencies WHERE type = $2)";
const getUserAccounts =
  "SELECT accounts.*, currencies.type AS currency FROM accounts JOIN currencies ON accounts.currency_id = currencies.id WHERE accounts.user_id = $1";
const getSpecificUserAccount = `SELECT a.*, c.type
FROM accounts a
JOIN currencies c ON a.currency_id = c.id
WHERE a.user_id = $1 AND a.account_number = $2
`;
const findUserAccountByAccountNumber = `SELECT a.*, c.type
FROM accounts a
JOIN currencies c ON a.currency_id = c.id
WHERE a.account_number = $1`;
const createTransaction =
  "INSERT INTO transactions (transaction_id) VALUES ($1) RETURNING *";
const makeDepositToUserAccount = `INSERT INTO deposits (id, amount, account_number, transaction_id, type)
VALUES ($1, $2, $3, $4, 'deposit')
RETURNING *`;
const makeWithdrawalFromUserAccount = `INSERT INTO withdrawals (id, amount, account_number, transaction_id, type)
VALUES ($1, $2, $3, $4, 'withdrawal')
RETURNING *`;
const payBillFromUserAccount = `INSERT INTO bills (id, amount, account_number, bill_type_id, transaction_id, type)
VALUES ($1, $2, $3, (SELECT id FROM bills_type WHERE type = $4), $5, 'bill')
RETURNING *`;
const makeTransferFromUserAccount = `INSERT INTO transfers (id, amount, source_account, destination_account, transaction_id, type)
VALUES ($1, $2, $3, $4, $5, 'transfer')
RETURNING *`;
const addDepositToAccountBalance =
  "UPDATE accounts SET account_balance = account_balance + $1 WHERE account_number = $2";

const removeWithdrawalFromAccountBalance =
  "UPDATE accounts SET account_balance = account_balance - $1 WHERE account_number = $2";
const removeBillPaymentFromAccountBalance =
  "UPDATE accounts SET account_balance = account_balance - $1 WHERE account_number = $2";
const getUserAccountTransactions = `SELECT transactions.*, deposits.*, withdrawals.*, bills.*, transfers.*, bills_type.type AS bill_type_name
FROM transactions
LEFT JOIN deposits ON transactions.transaction_id = deposits.transaction_id
LEFT JOIN withdrawals ON transactions.transaction_id = withdrawals.transaction_id
LEFT JOIN bills ON transactions.transaction_id = bills.transaction_id
LEFT JOIN transfers ON transactions.transaction_id = transfers.transaction_id
LEFT JOIN bills_type ON bills.bill_type_id = bills_type.id
WHERE deposits.account_number = $1 OR withdrawals.account_number = $1 OR bills.account_number = $1 OR transfers.source_account = $1;
`;
const checkIfBillTypeExists = "SELECT * FROM bills_type WHERE type = $1";

module.exports = {
  createAccount,
  findAccountByUserId,
  findAccountByUserIdAndCurrency,
  getUserAccounts,
  findUserAccountByAccountNumber,
  getSpecificUserAccount,
  makeDepositToUserAccount,
  makeWithdrawalFromUserAccount,
  createTransaction,
  addDepositToAccountBalance,
  removeWithdrawalFromAccountBalance,
  getUserAccountTransactions,
  checkIfBillTypeExists,
  payBillFromUserAccount,
  removeBillPaymentFromAccountBalance,
  makeTransferFromUserAccount,
};
