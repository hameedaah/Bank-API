const uuid = require("uuid");


const userUUID = async () => {
    const newUUID = await uuid.v4();   
    return newUUID;
}


const transactionID = async () => {
  const newUUID = await uuid.v4();
  const transactionID = newUUID.substring(0, 8);
  return transactionID;
};


module.exports = { userUUID, transactionID }