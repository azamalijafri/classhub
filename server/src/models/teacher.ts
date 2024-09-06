import { Schema, model, Document, Types } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  user: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

const Teacher = model<ITeacher>("Teacher", TeacherSchema);
export default Teacher;
