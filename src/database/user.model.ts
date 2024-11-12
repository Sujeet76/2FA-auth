import { Schema, models, model, Document, Types, Model } from "mongoose";

export interface IUser extends Document<Types.ObjectId> {
  email: string;
  avatar: string;
  password: string;
  isLocked: boolean;
  lockUntil?: Date;
  twoFactorSecret: string;
  isTwoFactorEnabled: boolean;
  loginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/9.x/initials/svg?seed=${
          this.email.split("@")[0]
        }`;
      },
    },
    password: {
      type: String,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    twoFactorSecret: {
      type: String,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);

export default User;
