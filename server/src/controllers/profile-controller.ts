import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";
import Student from "../models/student";
import Teacher from "../models/teacher";
import Principal from "../models/principal";
import passwordGenerator from "generate-password";
import School, { ISchool } from "../models/school";
import nodemailer from "nodemailer";
import { getSchool } from "../libs/utils";

let randomCount = 0;

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const generateUniqueEmail = async (baseEmail: string) => {
  let email = baseEmail;
  let existingUser = await User.findOne({ email });

  while (existingUser) {
    const emailParts = baseEmail.split("@");
    randomCount += 1;
    email = `${emailParts[0]}.${randomCount}@${emailParts[1]}`;
    existingUser = await User.findOne({ email });
  }

  return email;
};

const sendEmail = async (
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
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

const createUserAndProfile = async (
  name: string,
  email: string,
  role: IUser["role"],
  res: Response,
  school: ISchool,
  rollNo?: string
) => {
  try {
    const password = passwordGenerator.generate({
      length: 6,
      numbers: true,
    });

    const emailName = name.replace(/\s+/g, "").toLowerCase();
    let userSchoolEmail;

    if (rollNo) {
      userSchoolEmail = `${emailName}.${rollNo.toLowerCase()}@${
        school.schoolCode
      }.edu.com`;
    } else {
      userSchoolEmail = `${emailName}@${school.schoolCode}.edu.com`;
    }

    const uniqueEmail = await generateUniqueEmail(userSchoolEmail);
    const hashedPassword = await hashPassword(password);

    const user = new User({
      email: uniqueEmail,
      password: hashedPassword,
      role,
    });

    await user.save();

    let profile;
    if (role === "student") {
      profile = new Student({ user: user._id, name, school: school._id, rollNo:rollNo });
    } else if (role === "teacher") {
      profile = new Teacher({ user: user._id, name, school: school._id });
    }

    if (profile) {
      await profile.save();
    }

    await sendEmail(email, uniqueEmail, password);

    return res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: `Error creating ${role}`, error });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const school = await getSchool(req);
    await createUserAndProfile(name, email, "teacher", res, school);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { name, email, roll } = req.body;
  try {
    const school = await getSchool(req);
    await createUserAndProfile(name, email, "student", res, school, roll);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let profile;

    switch (role) {
      case "student":
        profile = await Student.findOne({ user: req.user?._id });
        break;
      case "teacher":
        profile = await Teacher.findOne({ user: req.user?._id });
        break;
      case "principal":
        profile = await Principal.findOne({ user: req.user?._id });
        break;
      default:
        return res.status(400).json({ message: "Invalid role type" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile, user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
