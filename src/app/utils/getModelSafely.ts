import { Model, model, models, Schema } from "mongoose";

export function getModelSafely<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T>) || model<T>(name, schema);
}
