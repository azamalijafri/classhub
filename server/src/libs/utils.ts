import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import School from "../models/school";
import User from "../models/user";

export const getSchool = async (req: Request) => {
  const school = await School.findOne({ _id: req.user.profile.school });
  if (school) {
    return school;
  } else {
    throw new Error("School not found");
  }
};

export const validate = (
  schema: { safeParse: (arg0: any) => any },
  values: any,
  res: Response
) => {
  const result = schema.safeParse(values);

  if (!result.success) {
    res.status(400).json({
      message: result.error.errors[0].message,
      errors: result.error.errors.map((item: any) => item.message),
    });
    return;
  }

  return result.data;
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const generateUniqueEmail = async (baseEmail: string) => {
  let email = baseEmail;
  let existingUser = await User.findOne({ email });
  let randomCount = 0;
  while (existingUser) {
    const emailParts = baseEmail.split("@");
    randomCount += 1;
    email = `${emailParts[0]}.${randomCount}@${emailParts[1]}`;
    existingUser = await User.findOne({ email });
  }

  return email;
};

export const sendEmail = async (
  toEmail: string,
  generatedEmail: string,
  password: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: toEmail,
    subject: "Your Account Registration Details",
    text: `Welcome! Your account has been successfully created.\n\nYour login details are as follows:\n\nEmail: ${generatedEmail}\nPassword: ${password}\n\nYou can change your password later after logging in.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
