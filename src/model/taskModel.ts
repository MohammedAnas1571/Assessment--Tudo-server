import { InferSchemaType, Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    taskNumber:{
        type:String,
        required: true,
        unique:true
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Todo", "InProgress", "Done"],
      default: "Todo",
    },
  },
  { timestamps: true }
);

type Task = InferSchemaType<typeof taskSchema>;

const taskModel = model<Task>("Task", taskSchema);

export { taskModel as Task };
