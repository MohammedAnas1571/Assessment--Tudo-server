
import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        firstname: { type: String, required: true },

        lastname: {
            type: String, required: true
        },
        email: {
            type: Number,
            required: true,
            unique:true,
        },
        password: {
            type: String,
            required: true
        },

    }, { timestamps: true }
);


type User = InferSchemaType<typeof userSchema>;

const userModel = model<User>("User", userSchema);

export { userModel as User };