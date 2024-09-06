import { Schema, model, Document, Types } from "mongoose";

export interface ISchool extends Document {
  name: string;
  principal: Types.ObjectId;
  address?: string;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    principal: {
      type: Schema.Types.ObjectId,
      ref: "Principal",
      required: true,
    },
    address: { type: String },
    contactInfo: { type: String },
  },
  { timestamps: true }
);

const School = model<ISchool>("School", SchoolSchema);
export default School;
