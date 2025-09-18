import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create demo tenant
  console.log('📊 Criando tenant demo...');
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Empresa Demo Ltda',
      cnpj: '12.345.678/0001-90',
      settings: {
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        approvalLevels: 2,
        maxFileSize: 10485760, // 10MB
      },
    },
  });

  // Create users with hashed passwords
  console.log('👥 Criando usuários demo...');
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Administrador Demo',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'gestor@demo.com',
      name: 'Gestor Demo',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const collaboratorUser = await prisma.user.create({
    data: {
      email: 'colaborador@demo.com',
      name: 'Colaborador Demo',
      passwordHash,
      role: 'COLLABORATOR',
    },
  });

  // Associate users with tenant
  await Promise.all([
    prisma.userTenant.create({
      data: {
        userId: adminUser.id,
        tenantId: demoTenant.id,
        roleOverride: 'ADMIN',
      },
    }),
    prisma.userTenant.create({
      data: {
        userId: managerUser.id,
        tenantId: demoTenant.id,
        roleOverride: 'MANAGER',
      },
    }),
    prisma.userTenant.create({
      data: {
        userId: collaboratorUser.id,
        tenantId: demoTenant.id,
        roleOverride: 'COLLABORATOR',
      },
    }),
  ]);

  // Create cost centers
  console.log('🏢 Criando centros de custo...');
  const costCenters = await Promise.all([
    prisma.costCenter.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Vendas',
        code: 'SALES',
      },
    }),
    prisma.costCenter.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Marketing',
        code: 'MKT',
      },
    }),
    prisma.costCenter.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Tecnologia',
        code: 'TECH',
      },
    }),
  ]);

  // Create projects
  console.log('📋 Criando projetos...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        tenantId: demoTenant.id,
        costCenterId: costCenters[0].id,
        name: 'Expansão Regional',
        code: 'EXP-REG',
      },
    }),
    prisma.project.create({
      data: {
        tenantId: demoTenant.id,
        costCenterId: costCenters[1].id,
        name: 'Campanha Digital 2025',
        code: 'CAMP-DIG',
      },
    }),
  ]);

  // Create policies
  console.log('📜 Criando políticas...');
  const policies = [
    {
      category: 'FOOD',
      receiptRequiredOver: 50.00,
      dailyLimit: 120.00,
      notes: 'Refeições durante viagens a trabalho. Recibo obrigatório acima de R$ 50.',
    },
    {
      category: 'ACCOMMODATION',
      receiptRequiredOver: 0.01,
      dailyLimit: 300.00,
      notes: 'Hospedagem durante viagens. Recibo sempre obrigatório.',
    },
    {
      category: 'TRANSPORT',
      receiptRequiredOver: 30.00,
      kmRate: 1.20,
      notes: 'Transporte e combustível. Recibo acima de R$ 30. Reembolso de R$ 1,20 por km.',
    },
    {
      category: 'TOLL',
      receiptRequiredOver: 0.01,
      notes: 'Pedágios durante viagens. Recibo sempre obrigatório.',
    },
    {
      category: 'PARKING',
      receiptRequiredOver: 10.00,
      dailyLimit: 50.00,
      notes: 'Estacionamento durante viagens. Recibo acima de R$ 10.',
    },
    {
      category: 'FUEL',
      receiptRequiredOver: 0.01,
      notes: 'Combustível para veículos da empresa. Recibo sempre obrigatório.',
    },
    {
      category: 'OTHER',
      receiptRequiredOver: 20.00,
      notes: 'Outras despesas relacionadas a viagens. Recibo acima de R$ 20.',
    },
  ];

  await Promise.all(
    policies.map(policy =>
      prisma.policy.create({
        data: {
          tenantId: demoTenant.id,
          category: policy.category as any,
          receiptRequiredOver: policy.receiptRequiredOver,
          dailyLimit: policy.dailyLimit,
          kmRate: policy.kmRate,
          notes: policy.notes,
        },
      })
    )
  );

  // Create budgets
  console.log('💰 Criando orçamentos...');
  const currentYear
  

