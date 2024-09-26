import { Schema, model, Document, Types } from "mongoose";

export interface IPrincipal extends Document {
  name: string;
  user: Types.ObjectId;
  school: Types.ObjectId;
}

const PrincipalSchema = new Schema<IPrincipal>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: Schema.Types.ObjectId, ref: "School", required: true },
});

const Principal = model<IPrincipal>("Principal", PrincipalSchema);
export default Principal;
