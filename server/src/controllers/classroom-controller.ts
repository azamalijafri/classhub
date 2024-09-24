import { Request, Response } from "express";
import Classroom from "../models/classroom";
import {
  assignStudentsSchema,
  assignTeacherSchema,
  createClassroomSchema,
} from "../validation/classroom-schema";
import { Types } from "mongoose";
import Teacher from "../models/teacher";
import Student from "../models/student";
import { getSchool, validate } from "../libs/utils";
import ClassroomSubject from "../models/classroom-subject";
import Subject from "../models/subject";
import { daysOfWeek } from "../constants/variables";
import Timetable from "../models/timetable";

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(createClassroomSchema, req.body, res);

    if (!validatedData) return;

    const { name, subjects } = validatedData;

    const school = await getSchool(req);

    const existingClassroom = await Classroom.findOne({
      name,
      school: school._id,
      status: 1,
    });

    if (existingClassroom)
      return res.status(409).json({
        message: "Classroom with this name already exist",
      });

    const classroom = await Classroom.create({
      name,
      school: school._id,
    });

    const classroomSubjects = subjects.map((subject: Types.ObjectId) => ({
      classroom: classroom._id,
      subject,
    }));

    await ClassroomSubject.insertMany(classroomSubjects);

    const timetabledays = daysOfWeek.map((day) => {
      return { day, classroom: classroom._id, periods: [] };
    });

    await Timetable.insertMany(timetabledays);

    return res.status(201).json({
      message: "Classroom created successfully",
      classroom,
      showMessage: true,
    });
  } catch (error) {
    console.log("create-classroom: ", error);

    return res.status(500).json({ message: "Error creating classroom", error });
  }
};

export const assignTeacherToClassroom = async (req: Request, res: Response) => {
  const validatedData = validate(assignTeacherSchema, req.body, res);

  if (!validatedData) {
    return;
  }

  const { teacherId, classroomId } = validatedData;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const existingClassroom = await Classroom.findOne({ teacher: teacherId });

    if (existingClassroom) {
      return res
        .status(400)
        .json({ message: "Teacher is already assigned to a classroom" });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    classroom.teacher = new Types.ObjectId(teacherId);
    await classroom.save();

    return res.status(200).json({
      message: "Teacher assigned to classroom successfully",
      classroom,
      showMessage: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error assigning teacher to classroom",
      error,
    });
  }
};

export const assignStudentsToClassroom = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = validate(assignStudentsSchema, req.body, res);

    if (!validatedData) return;

    const { studentsIds, classroomId } = validatedData;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const successfullyAssignedStudents: string[] = [];

    for (const studentId of studentsIds) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res
          .status(404)
          .json({ message: `Student with ID ${studentId} not found` });
      }

      student.classroom = new Types.ObjectId(classroomId);
      await student.save();

      successfullyAssignedStudents.push(studentId);
    }

    res.status(200).json({
      message: "Students assigned to classroom successfully",
      assignedStudents: successfullyAssignedStudents,
      classroom,
      showMessage: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning students to classroom", error });
  }
};

export const getAllClassrooms = async (req: Request, res: Response) => {
  try {
    const classrooms = await Classroom.find({
      school: req.user.profile.school,
      status: 1,
    }).populate("teacher");

    res.status(200).json({
      message: "Classrooms fetched successfully",
      classrooms,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching classrooms", error });
  }
};

export const getClassroomSubjects = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId);

    if (!classroom) return res.status(404).json({ message: "Class not found" });

    let classroomSubjects = await ClassroomSubject.find({
      classroom: classroom._id,
    });

    const subjects = [];
    for (let sub of classroomSubjects) {
      const subject = await Subject.findById(sub.subject);
      subjects.push(subject);
    }

    res.status(200).json({
      message: "Classroom subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching classroom subjects", error });
  }
};

export const getClassroomDetails = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId).populate("teacher");

    if (!classroom) return res.status(404).json({ message: "Class not found" });

    res.status(200).json({
      message: "Classroom details fetched successfully",
      classroom,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching classroom details", error });
  }
};

export const getClassroomDays = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId);
    const days = classroom?.days.map((day) => day.day);

    res.status(200).json({
      message: "Classroom days fetched successfully",
      days,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching classrooms days", error });
  }
};

export const deleteClassroom = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (
      req.user.role != "principal" &&
      classroom?.teacher?.toString() != req.user._id?.toString()
    ) {
      return res
        .status(400)
        .json({ message: "You cannot delete this classroom" });
    }

    await Classroom.findByIdAndUpdate(classroom?._id, { status: 0 });

    res.status(200).json({
      message: "Classroom deleted successfully",
      showMessage: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting classroom", error });
  }
};

export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const validatedData = validate(createClassroomSchema, req.body, res);
    if (!validatedData) return;

    const { name, subjects } = validatedData;

    const existingClassroomWithSameName = await Classroom.findOne({
      name,
      school: req.user.profile.school,
      _id: { $ne: classId },
      status: 1,
    });

    if (existingClassroomWithSameName) {
      return res.status(401).json({
        message: "Classroom with this name already present",
      });
    }

    const existingClassroom = await Classroom.findById(classId);
    if (!existingClassroom) {
      return res.status(404).json({
        message: "Classroom not found",
      });
    }

    await ClassroomSubject.deleteMany({ classroom: classId });
    const classroomSubjects = subjects.map((subject: Types.ObjectId) => ({
      classroom: classId,
      subject,
    }));
    await ClassroomSubject.insertMany(classroomSubjects);

    existingClassroom.name = name;
    await existingClassroom.save();

    return res.status(201).json({
      message: "Classroom updated successfully",
      showMessage: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating classroom", error });
  }
};
