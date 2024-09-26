import { Document, model, Schema, Types } from "mongoose";

interface IClassroomStudentAssociation extends Document {
  classroom: Types.ObjectId;
  student: Types.ObjectId;
}

const ClassroomStudentAssociationSchema =
  new Schema<IClassroomStudentAssociation>({
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Classroom",
    },
    student: { type: Schema.Types.ObjectId, required: true, ref: "Student" },
  });

const ClassroomStudentAssociation = model<IClassroomStudentAssociation>(
  "ClassroomStudentAssociation",
  ClassroomStudentAssociationSchema
);

export default ClassroomStudentAssociation;
