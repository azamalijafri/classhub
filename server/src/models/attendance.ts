import { Schema, model, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  classroom: Types.ObjectId;
  subject: Types.ObjectId;
  teacher: Types.ObjectId;
  period: Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    period: { type: Schema.Types.ObjectId, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const Attendance = model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
