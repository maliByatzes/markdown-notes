import { FileModel } from "../models/file.model";

export class FileService {
  async saveFile(fileName: string, contentType: string, buffer: Buffer) {
    const file = new FileModel({
      fileName,
      contentType,
      length: buffer.length,
      chunkSize: 261120,
      uploadDate: new Date(),
      data: buffer
    });

    await file.save();
    return file._id;
  }

  async getFile(fileId: string) {
    const file = await FileModel.findById(fileId);
    if (!file) {
      return null;
    }

    return {
      fileName: file.fileName,
      contentType: file.contentType,
      length: file.length,
      data: file.data
    };
  }
}
