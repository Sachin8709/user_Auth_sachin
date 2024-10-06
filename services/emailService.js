require('dotenv').config(); 
const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,  
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}`, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error; 
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  
  try {
    const OTP = generateOTP();
    await sendOTPEmail(email, OTP);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};

module.exports = {
  sendOTPEmail,
  forgotPassword,
};
