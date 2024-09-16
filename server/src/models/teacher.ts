import { Schema, model, Document, Types } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  user: Types.ObjectId;
  school: Types.ObjectId;
  subject: Types.ObjectId;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Teacher = model<ITeacher>("Teacher", TeacherSchema);
export default Teacher;
