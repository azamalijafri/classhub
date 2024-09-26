import { Document, model, Schema, Types } from "mongoose";

interface IClassroomSubjectAssociation extends Document {
  classroom: Types.ObjectId;
  subject: Types.ObjectId;
}

const ClassroomSubjectAssociationSchema =
  new Schema<IClassroomSubjectAssociation>({
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Classroom",
    },
    subject: { type: Schema.Types.ObjectId, required: true, ref: "Subject" },
  });

const ClassroomSubjectAssociation = model<IClassroomSubjectAssociation>(
  "ClassroomSubjectAssociation",
  ClassroomSubjectAssociationSchema
);

export default ClassroomSubjectAssociation;
