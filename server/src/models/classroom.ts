import { Schema, model, Document, Types } from "mongoose";

export interface IClassroom extends Document {
  name: string;
  school: Types.ObjectId;
  status: number;
  mentor?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true },
    status: { type: Number, default: 1 },
    mentor: { type: Schema.Types.ObjectId, ref: "Teacher" },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

const Classroom = model<IClassroom>("Classroom", ClassroomSchema);
export default Classroom;
