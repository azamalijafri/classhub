import { Schema, model, Document, Types } from "mongoose";

export interface IStudentAttendanceRecord extends Document {
  attendance: Types.ObjectId;
  student: Types.ObjectId;
  status: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttendanceSchema = new Schema<IStudentAttendanceRecord>(
  {
    attendance: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: {
      type: Number,
      required: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const StudentAttendance = model<IStudentAttendanceRecord>(
  "StudentAttendance",
  StudentAttendanceSchema
);
export default StudentAttendance;
