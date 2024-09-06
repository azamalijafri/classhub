import { Schema, model, Document, Types } from "mongoose";
import { Day } from "../enums/days";

interface ITimeSlot {
  day: Day;
  startTime: string;
  endTime: string;
}

export interface IClassroom extends Document {
  name: string;
  days: ITimeSlot[];
  teacher: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const Dayschema = new Schema<ITimeSlot>({
  day: { type: String, enum: Object.values(Day), required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true },
    days: { type: [Dayschema], required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

const Classroom = model<IClassroom>("Classroom", ClassroomSchema);
export default Classroom;
