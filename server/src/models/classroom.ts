import { Schema, model, Document, Types } from "mongoose";
import { Day } from "../enums/days";

export interface IClassroom extends Document {
  name: string;
  startTime: string;
  endTime: string;
  days: Day[];
  teacher: Types.ObjectId;
}

const ClassroomSchema = new Schema<IClassroom>({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  days: [{ type: String, enum: Object.values(Day), required: true }],
  teacher: { type: Schema.Types.ObjectId, ref: "User" },
});

const Classroom = model<IClassroom>("Classroom", ClassroomSchema);
export default Classroom;
