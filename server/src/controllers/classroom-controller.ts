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
import { getSchool } from "../libs/utils";

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const result = createClassroomSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    const { name, days } = result.data;

    const school = await getSchool(req);

    const existingClassroom = await Classroom.findOne({
      name,
      school: school._id,
    });

    if (existingClassroom)
      return res.status(409).json({
        message: "Classroom with this name already exist",
      });

    const classroom = new Classroom({
      name,
      days,
      school: school._id,
    });

    await classroom.save();
    return res.status(201).json({
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    console.log("create-classroom: ", error);

    return res.status(500).json({ message: "Error creating classroom", error });
  }
};

export const assignTeacherToClassroom = async (req: Request, res: Response) => {
  const result = assignTeacherSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors,
    });
  }

  const { teacherId, classroomId } = result.data;

  console.log(teacherId, classroomId);

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

    if (classroom.teacher)
      return res.status(500).json({
        message: "This classroom has already been assigned to a teacher",
      });

    classroom.teacher = new Types.ObjectId(teacherId);
    await classroom.save();

    return res.status(200).json({
      message: "Teacher assigned to classroom successfully",
      classroom,
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
    const { studentsIds, classroomId } = assignStudentsSchema.parse(req.body);

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

      // if (student.classroom) {
      //   return res
      //     .status(400)
      //     .json({
      //       message: `${student.name} is already assigned to a classroom`,
      //     });
      // }

      student.classroom = new Types.ObjectId(classroomId);
      await student.save();

      successfullyAssignedStudents.push(studentId);
    }

    res.status(200).json({
      message: "Students assigned to classroom successfully",
      assignedStudents: successfullyAssignedStudents,
      classroom,
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

export const getClassroomDetails = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId).populate("teacher");

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

    await Classroom.findByIdAndDelete(classroom?._id);

    res.status(200).json({
      message: "Classroom has been deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting classroom", error });
  }
};

export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const result = createClassroomSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    const { name, days } = result.data;

    const existingClassroomWithSameName = await Classroom.findOne({
      name,
      school: req.user.profile.school,
    });

    if (
      existingClassroomWithSameName &&
      existingClassroomWithSameName._id != classId
    )
      return res.status(401).json({
        message: "Classroom with this name already present",
      });

    const existingClassroom = await Classroom.findById(classId);

    if (!existingClassroom)
      return res.status(404).json({
        message: "Classroom not found",
      });

    await existingClassroom.updateOne({ name, days });
    await existingClassroom.save();

    return res.status(201).json({
      message: "Classroom updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating classroom", error });
  }
};
