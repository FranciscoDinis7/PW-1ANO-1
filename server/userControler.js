const User = require("../models/user");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Function to send confirmation email
const sendConfirmationEmail = async (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "joao.pteixeira2005@gmail.com", // Replace with your PW_BE Gmail account
        pass: "utbt qudw edzs fbwy", // Use the app password provided
      },
    });

    const verificationToken = generateVerificationToken();

    user.verificationToken = verificationToken;
    await user.save();

    const mailOptions = {
      from: "joao.pteixeira@gmail.com", // Sender email address
      to: user.email, // Recipient email address
      subject: "Confirm your registration",
      text: `Hello ${user.email}, please click on the following link to verify your account: http://localhost:3000/users/verify/${verificationToken}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

// Function to send email for password reset
const sendPasswordResetEmail = async (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "joao.pteixeira2005@gmail.com", // Replace with your Gmail account
        pass: "utbt qudw edzs fbwy", // Replace with the app password provided
      },
    });

    const resetToken = generateVerificationToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    const mailOptions = {
      from: "joao.pteixeira2005@gmail.com",
      to: user.email,
      subject: "Password Reset Request",
      text: `Hello ${user.email}, you have requested to reset your password. Please click on the following link to reset your password: http://localhost:3000/users/reset/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

// Function to handle password reset request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await sendPasswordResetEmail(user);

    res.status(200).json({
      message: "Password reset email sent. Check your email for instructions.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fu1d
exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Reset password and clear reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller methods
exports.registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const newUser = new User({ email, password, role });
    await newUser.save();

    // Send confirmation email
    await sendConfirmationEmail(newUser);

    res.status(201).json({
      message:
        "User registered successfully. Check your email for verification.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyUser = async (req, res) => {
  const { verificationToken } = req.params;

  try {
    // Find user by verification token
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already verified." });
    }

    // Update user as verified
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to generate verification token
const generateVerificationToken = () => {
  return uuidv4();
};