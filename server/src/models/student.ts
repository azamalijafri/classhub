import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;
  user: Types.ObjectId;
  classroom: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

const Student = model<IStudent>("Student", StudentSchema);
export default Student;
