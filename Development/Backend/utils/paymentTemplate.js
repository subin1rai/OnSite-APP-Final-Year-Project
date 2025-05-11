const generatePaymentTemplate = (data = {}) => {
    const {
      workerName = "Worker",
      month = "Month",
      year = "Year",
      amount = "0.00",
      projectName = "Project",
      date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transactionId = "XXXXXXXX"
    } = data;
  
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background-color: #D1FAE5;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-icon svg {
          width: 32px;
          height: 32px;
          fill: #10B981;
        }
        h1 {
          color: #111827;
          font-size: 24px;
          margin: 0;
          font-weight: 600;
        }
        .content {
          padding: 30px 0;
        }
        .payment-details {
          background-color: #F3F4F6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #6B7280;
          font-weight: 500;
        }
        .detail-value {
          font-weight: 600;
          color: #111827;
        }
        .highlight {
          font-size: 18px;
          color: #10B981;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          font-size: 14px;
          color: #6B7280;
          border-top: 1px solid #eee;
        }
        .btn {
          display: inline-block;
          background-color: #FCAC29;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 15px;
          text-align: center;
        }
        @media (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/diag9maev/image/upload/v1745519773/0_gf167q.png" alt="Company Logo" class="logo">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h1>Payment Successful!</h1>
        </div>
        
        <div class="content">
          <p>Dear Builder,</p>
          <p>This email confirms that the salary payment for <strong>${workerName}</strong> for the month of <strong>${month} ${year}</strong> has been successfully processed.</p>
          
          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Worker Name:</span>
              <span class="detail-value">${workerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Project:</span>
              <span class="detail-value">${projectName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Period:</span>
              <span class="detail-value">${month} ${year}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date Processed:</span>
              <span class="detail-value">${date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value highlight">₹ ${amount}</span>
            </div>
          </div>
          
          <p>The worker's attendance records for ${month} ${year} have been updated to reflect this payment.</p>
          
          <p style="text-align: center;">
            <a href="#" class="btn">View Payment Details</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for using our platform for your construction management needs.</p>
          <p>If you have any questions or concerns regarding this payment, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} OnSite. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };
  
  module.exports = { generatePaymentTemplate };
