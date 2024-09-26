import { Document, model, Schema, Types } from "mongoose";

interface IClassroomTeacherAssociation extends Document {
  classroom: Types.ObjectId;
  teacher: Types.ObjectId;
}

const ClassroomTeacherAssociationSchema =
  new Schema<IClassroomTeacherAssociation>({
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Classroom",
    },
    teacher: { type: Schema.Types.ObjectId, required: true, ref: "Teacher" },
  });

const ClassroomTeacherAssociation = model<IClassroomTeacherAssociation>(
  "ClassroomTeacherAssociation",
  ClassroomTeacherAssociationSchema
);

export default ClassroomTeacherAssociation;
