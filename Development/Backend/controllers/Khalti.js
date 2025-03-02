const axios = require("axios");

const KHALTI_BASE_URL = process.env.KHALTI_GATEWAY_URL || "https://a.khalti.com";

async function verifyKhaltiPayment(pidx) {
  if (!pidx) {
    throw new Error("pidx is required for verifying Khalti payment.");
  }

  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({ pidx });

  const reqOptions = {
    url: `${KHALTI_BASE_URL}/api/v2/epayment/lookup/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", error.response?.data || error);
    throw error;
  }
}

// Function to initialize Khalti Payment
async function initializeKhaltiPayment(details) {
  if (!details || !details.amount) {
    throw new Error("Invalid payment details provided.");
  }

  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify(details);

  const reqOptions = {
    url: `${KHALTI_BASE_URL}/api/v2/epayment/initiate/`, 
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return response.data;
  } catch (error) {
    console.error("Error initializing Khalti payment:", error.response?.data || error);
    throw error;
  }
}

module.exports = { verifyKhaltiPayment, initializeKhaltiPayment };
