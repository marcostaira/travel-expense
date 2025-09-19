import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import * as mime from "mime-types";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FilesService {
  private minioClient: MinioClient;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.minioClient = new MinioClient({
      endPoint: this.configService.get("MINIO_ENDPOINT", "localhost"),
      port: parseInt(this.configService.get("MINIO_PORT", "9000")),
      useSSL: this.configService.get("MINIO_USE_SSL", "false") === "true",
      accessKey: this.configService.get("MINIO_ACCESS_KEY", "minioadmin"),
      secretKey: this.configService.get("MINIO_SECRET_KEY", "minioadmin"),
    });

    this.bucketName = this.configService.get(
      "MINIO_BUCKET_NAME",
      "travel-expenses"
    );
  }

  async ensureBucketExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName);

      // Set bucket policy to allow read access for files
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy)
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    tenantId: string
  ): Promise<{ url: string; storageKey: string; mime: string; size: number }> {
    if (!file) {
      throw new BadRequestException("Nenhum arquivo fornecido");
    }

    // Validate file type
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Tipo de arquivo não permitido. Permitidos: imagens, PDF, documentos de texto e planilhas"
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException("Arquivo muito grande. Máximo: 10MB");
    }

    await this.ensureBucketExists();

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = extname(file.originalname);
    const storageKey = `${tenantId}/${folder}/${fileId}${fileExtension}`;

    // Upload file to MinIO
    await this.minioClient.putObject(
      this.bucketName,
      storageKey,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
        "Content-Disposition": `inline; filename="${file.originalname}"`,
      }
    );

    // Generate presigned URL that expires in 7 days
    const url = await this.minioClient.presignedUrl(
      "GET",
      this.bucketName,
      storageKey,
      24 * 60 * 60 * 7 // 7 days
    );

    return {
      url,
      storageKey,
      mime: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, storageKey);
    } catch (error) {
      // File might not exist, which is okay
      console.warn(
        `Failed to delete file from storage: ${storageKey}`,
        error.message
      );
    }
  }

  async getFileUrl(storageKey: string): Promise<string> {
    return this.minioClient.presignedUrl(
      "GET",
      this.bucketName,
      storageKey,
      24 * 60 * 60 // 24 hours
    );
  }

  async uploadExpenseFile(
    tenantId: string,
    expenseId: string,
    file: Express.Multer.File,
    description?: string
  ) {
    // Verify expense exists and belongs to tenant
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, tenantId },
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada");
    }

    // Upload file to storage
    const fileData = await this.uploadFile(file, "expenses", tenantId);

    // Save file record to database
    const expenseFile = await this.prisma.expenseFile.create({
      data: {
        expenseId,
        filename: file.originalname,
        url: fileData.url,
        storageKey: fileData.storageKey,
        mime: fileData.mime,
        size: fileData.size,
        description,
      },
    });

    // Update expense to mark it has receipt
    await this.prisma.expense.update({
      where: { id: expenseId },
      data: { hasReceipt: true },
    });

    return expenseFile;
  }

  async deleteExpenseFile(tenantId: string, expenseId: string, fileId: string) {
    // Verify expense file exists and belongs to tenant
    const expenseFile = await this.prisma.expenseFile.findFirst({
      where: {
        id: fileId,
        expense: {
          id: expenseId,
          tenantId,
        },
      },
    });

    if (!expenseFile) {
      throw new NotFoundException("Arquivo não encontrado");
    }

    // Delete from storage
    await this.deleteFile(expenseFile.storageKey);

    // Delete from database
    await this.prisma.expenseFile.delete({
      where: { id: fileId },
    });

    // Check if expense still has other files
    const remainingFiles = await this.prisma.expenseFile.count({
      where: { expenseId },
    });

    // Update expense receipt status
    if (remainingFiles === 0) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { hasReceipt: false },
      });
    }

    return { message: "Arquivo removido com sucesso" };
  }

  async getExpenseFiles(tenantId: string, expenseId: string) {
    // Verify expense exists and belongs to tenant
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, tenantId },
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada");
    }

    const files = await this.prisma.expenseFile.findMany({
      where: { expenseId },
      orderBy: { createdAt: "desc" },
    });

    // Update URLs with fresh presigned URLs
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.getFileUrl(file.storageKey),
      }))
    );

    return filesWithUrls;
  }

  // OCR Mock Service - Simple parser for demonstration
  async performOCR(file: Express.Multer.File): Promise<{
    amount?: number;
    date?: string;
    vendor?: string;
    cnpj?: string;
  }> {
    // This is a mock implementation
    // In production, integrate with services like AWS Textract, Google Vision API, etc.

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time

    // Mock OCR results with some random but realistic data
    const mockResults = [
      {
        amount: 45.9,
        date: new Date().toISOString().split("T")[0],
        vendor: "Restaurante do João",
        cnpj: "12.345.678/0001-90",
      },
      {
        amount: 120.0,
        date: new Date().toISOString().split("T")[0],
        vendor: "Hotel Central",
        cnpj: "98.765.432/0001-10",
      },
      {
        amount: 25.5,
        date: new Date().toISOString().split("T")[0],
        vendor: "Posto Shell",
        cnpj: "11.222.333/0001-44",
      },
    ];

    // Return random mock result
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }
}
