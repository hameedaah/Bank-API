const pool = require("../config/db");
const queries = require("../sql/authQueries");

const checkIfEmailExists = async (email) => {
  try {
    const { rows } = await pool.query(queries.checkIfEmailExists, [email]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const checkIfIdAndEmailExists = async (payload) => {
  try {
    const { rows } = await pool.query(queries.checkIfIdAndEmailExists, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const checkIfSuperAdminExists = async () => {
  try {
    const { rows } = await pool.query(queries.checkIfSuperAdminExists);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const checkIfStaffExists = async (id) => {
  try {
    const { rows } = await pool.query(queries.checkIfStaffExists, [id]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const createSuperAdmin = async (payload) => {
  try {
    const { rows } = await pool.query(queries.createSuperAdmin, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const registerUser = async (payload) => {
  console.log(payload)
  try {
    const { rows } = await pool.query(queries.registerUser, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const updateStaffToAdmin = async (staffId) => {
  try {
    const { rows } = await pool.query(queries.updateStaffToAdmin, [staffId]);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

const resetPassword = async (payload) => {
  try {
    const { rows } = await pool.query(queries.resetPassword, payload);
    return rows;
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  checkIfEmailExists,
  checkIfIdAndEmailExists,
  checkIfSuperAdminExists,
  checkIfStaffExists,
  registerUser,
  createSuperAdmin,
  updateStaffToAdmin,
  resetPassword
};
