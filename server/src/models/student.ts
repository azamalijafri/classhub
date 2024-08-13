import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  name: string;
  user: Types.ObjectId;
  classroom: Types.ObjectId;
}

const StudentSchema = new Schema<IStudent>({
  name: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
});

const Student = model<IStudent>("Student", StudentSchema);
export default Student;
