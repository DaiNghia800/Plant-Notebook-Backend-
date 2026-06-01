const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Plant Notebook" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Mã OTP lấy lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2E7B36; text-align: center;">Plant Notebook</h2>
        <p style="font-size: 16px; color: #333;">Chào bạn,</p>
        <p style="font-size: 16px; color: #333;">Bạn vừa yêu cầu lấy lại mật khẩu cho tài khoản ứng dụng Plant Notebook.</p>
        <div style="background-color: #F1F6F3; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #6B8071; margin: 0 0 10px 0;">Mã OTP của bạn là:</p>
          <h1 style="font-size: 32px; color: #135022; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">Mã này có hiệu lực trong vòng 5 phút.</p>
        <p style="font-size: 14px; color: #666; text-align: center;">Nếu bạn không yêu cầu lấy lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Trân trọng,<br>Đội ngũ Plant Notebook</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
