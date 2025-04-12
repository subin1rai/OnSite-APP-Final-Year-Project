const generatePasswordResetTemplate = (otp) => {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
        background-color: white;
      }
      .banner {
        background-color: #ffb133;
        padding: 24px 0;
        text-align: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      .banner-logo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: white;
        display: inline-block;
        text-align: center;
        line-height: 80px;
        color: #ffb133;
        font-size: 36px;
        margin-bottom: 10px;
      }
      .banner-text {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 10px 0 0 0;
      }
      .content {
        background-color: white;
        padding: 30px;
        border-radius: 0 0 8px 8px;
      }
      .title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333333;
        text-align: center;
      }
      .code-container {
        margin: 30px 0;
        text-align: center;
      }
      .code {
        display: inline-block;
        padding: 15px 30px;
        background-color: #f5f5f5;
        border-radius: 8px;
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #333333;
        border: 1px solid #e0e0e0;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        color: #888888;
        font-size: 14px;
      }
      .help {
        margin: 25px 0;
        color: #666666;
      }
      .expiry {
        font-size: 14px;
        color: #777777;
        margin-bottom: 25px;
        text-align: center;
      }
      .outer-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .shadow-box {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div class="outer-container">
      <div class="shadow-box">
        <div class="container">
          <!-- Banner Section -->
        <div class="banner">
          <img src="https://res.cloudinary.com/diag9maev/image/upload/v1743001208/0_dld0zx.png" alt="Company Logo" class="banner-logo">
          <h2 class="banner-text">Password Reset</h2>
        </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset your password. Use the verification code below to complete the process:</p>
            
            <div class="code-container">
              <div class="code">${otp}</div>
            </div>
            
            <p class="expiry">This code will expire in 6 minutes.</p>
            
            <p class="help">If you didn't request a password reset, you can safely ignore this email. Your account security is important to us.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
  };
  
  module.exports = {
    generatePasswordResetTemplate
  };