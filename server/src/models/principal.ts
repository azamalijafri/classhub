import { Schema, model, Document, Types } from "mongoose";

export interface IPrincipal extends Document {
  name: string;
  user: Types.ObjectId;
}

const PrincipalSchema = new Schema<IPrincipal>({
  name: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Principal = model<IPrincipal>("Principal", PrincipalSchema);
export default Principal;
