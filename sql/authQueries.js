const checkIfEmailExists =
  "SELECT users.*, roles.role AS role_name FROM users INNER JOIN roles ON users.role_id = roles.id WHERE users.email = $1";
const checkIfIdAndEmailExists =
  "SELECT users.*, roles.role AS role_name FROM users INNER JOIN roles ON users.role_id = roles.id WHERE users.id = $1 AND users.email = $2";
const checkIfSuperAdminExists =
  "SELECT * FROM users WHERE role_id = (SELECT id FROM roles WHERE role = 'superAdmin')";
const checkIfStaffExists =
  "SELECT * FROM users WHERE id = $1 AND role_id = (SELECT id FROM roles WHERE role = 'staff')";
const createSuperAdmin = `INSERT INTO users (username, email, password, role_id, id)
VALUES ($1, $2, $3, (SELECT id FROM roles WHERE role = 'superAdmin'), $4)
RETURNING username`;
const registerUser =
  "INSERT INTO users (username, email, password, role_id, id) VALUES ($1, $2, $3, (SELECT id FROM roles WHERE role = $4), $5) RETURNING users.*, (SELECT role FROM roles WHERE id = users.role_id) AS role_name";
const updateStaffToAdmin =
  "UPDATE users SET role_id = (SELECT id FROM roles WHERE role = 'admin') WHERE id = $1 RETURNING *";
const resetPassword = "UPDATE users SET password = $1 WHERE email = $2";


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
