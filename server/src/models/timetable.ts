import { Schema, model, Document, Types } from "mongoose";
import { Day } from "../enums/days";

export interface IPeriod extends Document {
  subject: string;
  startTime: string;
  endTime: string;
}

export interface ITimetable extends Document {
  classroom: Types.ObjectId;
  day: Day;
  periods: IPeriod[];
}

const PeriodSchema = new Schema<IPeriod>({
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const TimetableSchema = new Schema<ITimetable>({
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
  day: { type: String, enum: Object.values(Day), required: true },
  periods: [PeriodSchema],
});

const Timetable = model<ITimetable>("Timetable", TimetableSchema);
export default Timetable;
