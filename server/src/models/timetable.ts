import { Schema, model, Document, Types } from "mongoose";
import { Day } from "../enums/days";

export interface IPeriod {
  subject: Types.ObjectId;
  startTime: string;
  endTime: string;
  teacher: Types.ObjectId;
}

export interface ITimetable extends Document {
  classroom: Types.ObjectId;
  day: Day;
  periods: IPeriod[];
}

const PeriodSchema = new Schema<IPeriod>({
  subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
});

const TimetableSchema = new Schema<ITimetable>({
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
  day: { type: String, enum: Object.values(Day), required: true },
  periods: [PeriodSchema],
});

const Timetable = model<ITimetable>("Timetable", TimetableSchema);
export default Timetable;
