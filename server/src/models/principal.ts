import { Schema, model, Document, Types } from "mongoose";

export interface IPrincipal extends Document {
  name: string;
  user: Types.ObjectId;
  school?: Types.ObjectId;
}

const PrincipalSchema = new Schema<IPrincipal>({
  name: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: Schema.Types.ObjectId, ref: "School" },
});

const Principal = model<IPrincipal>("Principal", PrincipalSchema);
export default Principal;
