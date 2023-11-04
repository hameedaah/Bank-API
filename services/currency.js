require("dotenv").config();
const axios = require("axios");
const apiKey = process.env.API_KEY; 


const getCurrencies = async () => {
  const config = {
    method: "get",
    url: "https://api.apilayer.com/currency_data/list",
    headers: {
      apikey: apiKey,
    },
  };

  try {
    const response = await axios(config);
    return response.data.currencies;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};

const convertAmount = async (sourceCurrency, destinationCurrency, amount) => {
  const conversionUrl = `https://api.apilayer.com/currency_data/convert?to=${destinationCurrency}&from=${sourceCurrency}&amount=${amount}`;

   const config = {
     method: "get",
     url: conversionUrl,
     headers: {
       apikey: apiKey,
     },
   };

  try {
    const response = await axios(config);
    return response.data.result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};


module.exports = {
  getCurrencies,
  convertAmount,
}