import { Document, model, Schema, Types } from "mongoose";

interface IClassroomSubject extends Document {
  classroom: Types.ObjectId;
  subject: Types.ObjectId;
}

const ClassroomSubjectSchema = new Schema<IClassroomSubject>({
  classroom: { type: Schema.Types.ObjectId, required: true, ref: "Classroom" },
  subject: { type: Schema.Types.ObjectId, required: true, ref: "Subject" },
});

const ClassroomSubject = model<IClassroomSubject>(
  "ClassroomSubject",
  ClassroomSubjectSchema
);
export default ClassroomSubject;
