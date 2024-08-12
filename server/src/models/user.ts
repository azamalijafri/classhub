import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "principal" | "teacher" | "student";
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["principal", "teacher", "student"],
    required: true,
  },
});

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = model<IUser>("User", UserSchema);
export default User;
