import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { PoliciesService } from '../policies/policies.service';
import { FxService } from '../fx/fx.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UploadExpenseFileDto } from './dto/upload-expense-file.dto';

interface PolicyCheck {
  receiptRequired: boolean;
  receiptMissing?: boolean;
  exceedsDailyLimit?: boolean;
  dailyLimit?: number;
  dailySpent?: number;
  valid: boolean;
  warnings: string[];
  errors: string[];
}

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private policiesService: PoliciesService,
    private fxService: FxService,
  ) {}

  async create(tenantId: string, userId: string, createExpenseDto: CreateExpenseDto) {
    // Convert amount to BRL if needed
    let amountBrl = createExpenseDto.amount;
    if (createExpenseDto.currency !== 'BRL') {
      amountBrl = await this.fxService.convertToBrl(createExpenseDto.amount, createExpenseDto.currency);
    }

    // Check policy compliance
    const policyCheck = await this.checkPolicyCompliance(
      tenantId,
      createExpenseDto.category,
      createExpenseDto.date,
      userId,
      amountBrl,
      createExpenseDto.hasReceipt || false,
    );

    const expense = await this.prisma.expense.create({
      data: {
        tenantId,
        userId,
        ...createExpenseDto,
        amountBrl,
        policyCheck: policyCheck,
        date: new Date(createExpenseDto.date),
      },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    return expense;
  }

  async findAll(
    tenantId: string,
    userId?: string,
    role?: string,
    page = 1,
    limit = 20,
    filters: {
      status?: string;
      category?: string;
      dateFrom?: Date;
      dateTo?: Date;
      tripId?: string;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ExpenseWhereInput = { tenantId };

    // Apply role-based filtering
    if (role === 'COLLABORATOR') {
      where.userId = userId;
    } else if (role === 'MANAGER') {
      // Managers can see expenses from their cost centers
      where.OR = [
        { userId         },
        {
          costCenter: {
            // This would need proper implementation based on manager-cost center relationship
          },
        },
      ];
    }

    // Apply filters
    if (filters.status) {
      where.status = filters.status as any;
    }
    if (filters.category) {
      where.category = filters.category as any;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }
    if (filters.tripId) {
      where.tripId = filters.tripId;
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          files: true,
          user: { select: { id: true, name: true, email: true } },
          costCenter: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
          trip: { select: { id: true, origin: true, destination: true, purpose: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string, userId?: string, role?: string) {
    const where: Prisma.ExpenseWhereInput = { id, tenantId };

    // Apply role-based filtering
    if (role === 'COLLABORATOR') {
      where.userId = userId;
    }

    const expense = await this.prisma.expense.findFirst({
      where,
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return expense;
  }

  async update(tenantId: string, id: string, userId: string, role: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow updates if expense is in draft status or user is admin
    if (expense.status !== 'DRAFT' && role !== 'ADMIN') {
      throw new BadRequestException('Apenas despesas em rascunho podem ser editadas');
    }

    // If user is collaborator, only allow updates to their own expenses
    if (role === 'COLLABORATOR' && expense.userId !== userId) {
      throw new BadRequestException('Você só pode editar suas próprias despesas');
    }

    let amountBrl = expense.amountBrl;
    if (updateExpenseDto.amount !== undefined && updateExpenseDto.currency !== undefined) {
      if (updateExpenseDto.currency !== 'BRL') {
        amountBrl = await this.fxService.convertToBrl(updateExpenseDto.amount, updateExpenseDto.currency);
      } else {
        amountBrl = updateExpenseDto.amount;
      }
    }

    // Re-check policy compliance if relevant fields changed
    let policyCheck = expense.policyCheck;
    if (updateExpenseDto.amount !== undefined || updateExpenseDto.category !== undefined || updateExpenseDto.date !== undefined) {
      policyCheck = await this.checkPolicyCompliance(
        tenantId,
        updateExpenseDto.category || expense.category,
        updateExpenseDto.date ? new Date(updateExpenseDto.date) : expense.date,
        expense.userId,
        amountBrl,
        updateExpenseDto.hasReceipt !== undefined ? updateExpenseDto.hasReceipt : expense.hasReceipt,
      );
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...updateExpenseDto,
        amountBrl,
        policyCheck,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    return updatedExpense;
  }

  async remove(tenantId: string, id: string, userId: string, role: string) {
    const expense = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow deletion if expense is in draft status or user is admin
    if (expense.status !== 'DRAFT' && role !== 'ADMIN') {
      throw new BadRequestException('Apenas despesas em rascunho podem ser excluídas');
    }

    // If user is collaborator, only allow deletion of their own expenses
    if (role === 'COLLABORATOR' && expense.userId !== userId) {
      throw new BadRequestException('Você só pode excluir suas próprias despesas');
    }

    // Delete associated files first
    for (const file of expense.files) {
      await this.filesService.deleteFile(file.storageKey);
    }

    await this.prisma.expense.delete({ where: { id } });

    return { message: 'Despesa excluída com sucesso' };
  }

  async uploadFile(tenantId: string, expenseId: string, userId: string, role: string, uploadDto: UploadExpenseFileDto, file: Express.Multer.File) {
    const expense = await this.findOne(tenantId, expenseId, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow file upload to own expenses for collaborators
    if (role === 'COLLABORATOR' && expense.userId !== userId) {
      throw new BadRequestException('Você só pode adicionar arquivos às suas próprias despesas');
    }

    const uploadResult = await this.filesService.uploadFile(file, 'expense-receipts');

    const expenseFile = await this.prisma.expenseFile.create({
      data: {
        expenseId,
        url: uploadResult.url,
        storageKey: uploadResult.key,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    // Update expense to mark as having receipt
    await this.prisma.expense.update({
      where: { id: expenseId },
      data: { hasReceipt: true },
    });

    return expenseFile;
  }

  async deleteFile(tenantId: string, expenseId: string, fileId: string, userId: string, role: string) {
    const expense = await this.findOne(tenantId, expenseId, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow file deletion from own expenses for collaborators
    if (role === 'COLLABORATOR' && expense.userId !== userId) {
      throw new BadRequestException('Você só pode remover arquivos das suas próprias despesas');
    }

    const file = await this.prisma.expenseFile.findFirst({
      where: { id: fileId, expenseId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    await this.filesService.deleteFile(file.storageKey);
    await this.prisma.expenseFile.delete({ where: { id: fileId } });

    // Check if expense still has other receipts
    const remainingFiles = await this.prisma.expenseFile.count({
      where: { expenseId },
    });

    if (remainingFiles === 0) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { hasReceipt: false },
      });
    }

    return { message: 'Arquivo removido com sucesso' };
  }

  async submit(tenantId: string, id: string, userId: string, role: string) {
    const expense = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    if (expense.status !== 'DRAFT') {
      throw new BadRequestException('Apenas despesas em rascunho podem ser enviadas');
    }

    // If user is collaborator, only allow submission of their own expenses
    if (role === 'COLLABORATOR' && expense.userId !== userId) {
      throw new BadRequestException('Você só pode enviar suas próprias despesas');
    }

    // Check policy compliance
    const policyCheck = expense.policyCheck as PolicyCheck;
    if (!policyCheck.valid) {
      throw new BadRequestException(`Despesa não está em conformidade com a política: ${policyCheck.errors.join(', ')}`);
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    // TODO: Send notification to manager

    return updatedExpense;
  }

  async approve(tenantId: string, id: string, userId: string, notes?: string) {
    const expense = await this.findOne(tenantId, id);

    if (expense.status !== 'SUBMITTED') {
      throw new BadRequestException('Apenas despesas enviadas podem ser aprovadas');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: 'APPROVED',
        notes: notes ? `${expense.notes || ''}\n[Aprovação] ${notes}`.trim() : expense.notes,
      },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    // TODO: Send notification to employee
    // TODO: Update budget spent amount

    return updatedExpense;
  }

  async reject(tenantId: string, id: string, userId: string, reason: string) {
    const expense = await this.findOne(tenantId, id);

    if (expense.status !== 'SUBMITTED') {
      throw new BadRequestException('Apenas despesas enviadas podem ser rejeitadas');
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Motivo da rejeição é obrigatório');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: `${expense.notes || ''}\n[Rejeição] ${reason}`.trim(),
      },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    // TODO: Send notification to employee

    return updatedExpense;
  }

  async adjust(tenantId: string, id: string, userId: string, adjustedAmount: number, reason: string) {
    const expense = await this.findOne(tenantId, id);

    if (expense.status !== 'SUBMITTED') {
      throw new BadRequestException('Apenas despesas enviadas podem ser ajustadas');
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Motivo do ajuste é obrigatório');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: 'ADJUSTED',
        amountBrl: adjustedAmount,
        amount: expense.currency === 'BRL' ? adjustedAmount : expense.amount, // Keep original currency amount
        notes: `${expense.notes || ''}\n[Ajuste] Valor alterado de ${expense.amountBrl} para ${adjustedAmount}. Motivo: ${reason}`.trim(),
      },
      include: {
        files: true,
        user: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        trip: { select: { id: true, origin: true, destination: true, purpose: true } },
      },
    });

    // TODO: Send notification to employee

    return updatedExpense;
  }

  private async checkPolicyCompliance(
    tenantId: string,
    category: string,
    date: Date,
    userId: string,
    amountBrl: number,
    hasReceipt: boolean,
  ): Promise<PolicyCheck> {
    const policy = await this.policiesService.findByCategory(tenantId, category);
    const result: PolicyCheck = {
      receiptRequired: false,
      valid: true,
      warnings: [],
      errors: [],
    };

    if (!policy) {
      return result;
    }

    // Check receipt requirement
    if (policy.receiptRequiredOver && amountBrl >= policy.receiptRequiredOver.toNumber()) {
      result.receiptRequired = true;
      if (!hasReceipt) {
        result.receiptMissing = true;
        result.valid = false;
        result.errors.push(`Recibo obrigatório para valores acima de R$ ${policy.receiptRequiredOver}`);
      }
    }

    // Check daily limit
    if (policy.dailyLimit) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dailySpent = await this.prisma.expense.aggregate({
        where: {
          tenantId,
          userId,
          category,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: {
            in: ['SUBMITTED', 'APPROVED', 'ADJUSTED'],
          },
        },
        _sum: {
          amountBrl: true,
        },
      });

      const totalDailySpent = (dailySpent._sum.amountBrl?.toNumber() || 0) + amountBrl;
      result.dailyLimit = policy.dailyLimit.toNumber();
      result.dailySpent = totalDailySpent;

      if (totalDailySpent > policy.dailyLimit.toNumber()) {
        result.exceedsDailyLimit = true;
        result.warnings.push(`Limite diário excedido (R$ ${policy.dailyLimit} - gasto hoje: R$ ${totalDailySpent})`);
      }
    }

    return result;
  }
}