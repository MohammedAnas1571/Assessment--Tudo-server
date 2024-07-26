import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePhoto: {
            type: String,
            default:"https://img.freepik.com/premium-photo/memoji-happy-man-white-background-emoji_826801-6836.jpg?w=740"        },
    },
    { timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;

const userModel = model<User>("User", userSchema);

export { userModel as User };
