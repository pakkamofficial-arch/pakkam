import mongoose, { Schema, Document } from 'mongoose';

export interface IAppSetting extends Document {
  key: string;
  value: any;
  description?: string;
}

const AppSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const AppSetting = mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);
