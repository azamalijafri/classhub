import { Schema, model, Document, Types } from "mongoose";

export interface ISchool extends Document {
  name: string;
  code: string;
  address?: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    code: {
      type: String,
      required: true,
    },
    address: { type: String },
    contact: { type: String },
  },
  { timestamps: true }
);

const School = model<ISchool>("School", SchoolSchema);
export default School;
