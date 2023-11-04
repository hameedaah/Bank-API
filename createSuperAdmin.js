require("dotenv").config();
const authModel = require("./models/authModel");
const hash = require("./services/hash");
const { userUUID } = require("./services/uuid");

async function createSuperAdminIfNotExists() {
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminUsername || !superAdminEmail || !superAdminPassword) {
    console.error(
      "Super admin details are missing"
    );
    return;
  }

    try {
      const superAdminCheckResult = await authModel.checkIfSuperAdminExists()
        if (superAdminCheckResult.length === 0) {
            const id = await userUUID();
            const hashedPassword = await hash.hashing(superAdminPassword);
            const payload = [
              superAdminUsername,
              superAdminEmail,
              hashedPassword,
              id
            ];
            const createSuperAdmin = await authModel.createSuperAdmin(payload)
         console.log(`Super Admin ${createSuperAdmin[0].username} created`);
       } else {
         console.log(`Super Admin ${superAdminUsername} exists`);
       }
  } catch (error) {
        console.error("Error creating the super admin:", error);
  }
}

module.exports = {
    createSuperAdminIfNotExists
}
