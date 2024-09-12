import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;
  user: Types.ObjectId;
  classroom: Types.ObjectId;
  school: Types.ObjectId;
  rollNo: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
    rollNo: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Student = model<IStudent>("Student", StudentSchema);
export default Student;
