import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  user: Types.ObjectId;
  classroom: Types.ObjectId;
}

const StudentSchema = new Schema<IStudent>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
});

const Student = model<IStudent>("Student", StudentSchema);
export default Student;
