import { Schema, model, Document, Types } from "mongoose";

export interface IStudentAttendance extends Document {
  attendance: Types.ObjectId;
  student: Types.ObjectId;
  status: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    attendance: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: Number, enum: [0, 1], required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const StudentAttendance = model<IStudentAttendance>(
  "StudentAttendance",
  StudentAttendanceSchema
);
export default StudentAttendance;
