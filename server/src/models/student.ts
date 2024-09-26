import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;
  user: Types.ObjectId;
  school: Types.ObjectId;
  roll: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roll: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Student = model<IStudent>("Student", StudentSchema);
export default Student;
