import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileName: String,
  contentType: String,
  length: Number,
  chunkSize: Number,
  uploadDate: Date,
  metadata: Object,
  data: Buffer
});

export const FileModel = mongoose.model('File', fileSchema);
