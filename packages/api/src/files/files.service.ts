import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private minioClient: Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME') || 'travel-receipts';
    
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get('MINIO_PORT') || '9000'),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin123',
    });

    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = ''): Promise<{ url: string; key: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const objectKey = folder ? `${folder}/${fileName}` : fileName;

    await this.minioClient.putObject(this.bucketName, objectKey, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = await this.minioClient.presignedGetObject(this.bucketName, objectKey, 24 * 60 * 60); // 24 hours

    return {
      url,
      key: objectKey,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, key);
  }

  async getFileUrl(key: string, expiry: number = 24 * 60 * 60): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucketName, key, expiry);
  }
}