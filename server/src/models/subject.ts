import { Schema, model, Document, Types } from "mongoose";

export interface ISubject extends Document {
  name: string;
  school: Types.ObjectId;
  createdBy: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

const Subject = model<ISubject>("Subject", SubjectSchema);
export default Subject;
