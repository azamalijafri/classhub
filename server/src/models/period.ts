import { model, Schema, Types } from "mongoose";

export interface IPeriod extends Document {
  timetable: Types.ObjectId;
  subject: Types.ObjectId;
  startTime: string;
  endTime: string;
  teacher: Types.ObjectId;
}

const PeriodSchema = new Schema<IPeriod>({
  timetable: { type: Schema.Types.ObjectId, ref: "Timetable", required: true },
  subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
});

const Period = model<IPeriod>("Period", PeriodSchema);
export default Period;
