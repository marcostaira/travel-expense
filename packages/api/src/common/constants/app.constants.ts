// User Roles
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  COLLABORATOR = "COLLABORATOR",
}

// Trip Status
export enum TripStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

// Expense Status
export enum ExpenseStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ADJUSTED = "ADJUSTED",
  REIMBURSED = "REIMBURSED",
}

// Advance Status
export enum AdvanceStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
}

// Reimbursement Status
export enum ReimbursementStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  EXPORTED = "EXPORTED",
}

// Expense Categories
export enum ExpenseCategory {
  ACCOMMODATION = "ACCOMMODATION",
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  FUEL = "FUEL",
  PARKING = "PARKING",
  TOLL = "TOLL",
  OTHER = "OTHER",
}

// Budget Periods
export enum BudgetPeriod {
  YEARLY = "YEARLY",
  QUARTERLY = "QUARTERLY",
  MONTHLY = "MONTHLY",
}

// Currencies
export enum Currency {
  BRL = "BRL",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
}

// File Types
export enum FileType {
  IMAGE = "image",
  PDF = "pdf",
  DOCUMENT = "document",
  SPREADSHEET = "spreadsheet",
}

// Notification Types
export enum NotificationType {
  TRIP_SUBMITTED = "TRIP_SUBMITTED",
  TRIP_APPROVED = "TRIP_APPROVED",
  TRIP_REJECTED = "TRIP_REJECTED",
  EXPENSE_SUBMITTED = "EXPENSE_SUBMITTED",
  EXPENSE_APPROVED = "EXPENSE_APPROVED",
  EXPENSE_REJECTED = "EXPENSE_REJECTED",
  EXPENSE_ADJUSTED = "EXPENSE_ADJUSTED",
  ADVANCE_SUBMITTED = "ADVANCE_SUBMITTED",
  ADVANCE_APPROVED = "ADVANCE_APPROVED",
  ADVANCE_REJECTED = "ADVANCE_REJECTED",
  REIMBURSEMENT_READY = "REIMBURSEMENT_READY",
  POLICY_VIOLATION = "POLICY_VIOLATION",
  BUDGET_EXCEEDED = "BUDGET_EXCEEDED",
}

// Audit Actions
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  SUBMIT = "SUBMIT",
  ARCHIVE = "ARCHIVE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

// API Constants
export const API_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],

  // Authentication
  JWT_ACCESS_TOKEN_EXPIRY: "15m",
  JWT_REFRESH_TOKEN_EXPIRY: "7d",
  PASSWORD_RESET_TOKEN_EXPIRY: "1h",

  // Rate Limiting
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_AUTH_MAX_REQUESTS: 5, // For auth endpoints

  // Business Rules
  MIN_ADVANCE_AMOUNT: 50,
  MAX_ADVANCE_AMOUNT: 10000,
  MIN_EXPENSE_AMOUNT: 0.01,
  MAX_EXPENSE_AMOUNT: 50000,

  // Exchange Rates
  EXCHANGE_RATE_CACHE_TTL: 24 * 60 * 60, // 24 hours in seconds

  // Notifications
  NOTIFICATION_BATCH_SIZE: 100,

  // Sync
  SYNC_BATCH_SIZE: 50,
  OFFLINE_DATA_RETENTION_DAYS: 30,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Email ou senha inválidos",
  ACCOUNT_DISABLED: "Conta desabilitada",
  TOKEN_EXPIRED: "Token expirado",
  TOKEN_INVALID: "Token inválido",
  ACCESS_DENIED: "Acesso negado",

  // Validation
  REQUIRED_FIELD: "Campo obrigatório",
  INVALID_EMAIL: "Email inválido",
  INVALID_PASSWORD: "Senha deve ter pelo menos 8 caracteres",
  INVALID_PHONE: "Telefone inválido",
  INVALID_CNPJ: "CNPJ inválido",
  INVALID_CPF: "CPF inválido",
  INVALID_DATE: "Data inválida",
  INVALID_CURRENCY_AMOUNT: "Valor monetário inválido",

  // Business Rules
  TRIP_NOT_FOUND: "Viagem não encontrada",
  EXPENSE_NOT_FOUND: "Despesa não encontrada",
  ADVANCE_NOT_FOUND: "Adiantamento não encontrado",
  USER_NOT_FOUND: "Usuário não encontrado",
  TENANT_NOT_FOUND: "Empresa não encontrada",
  POLICY_VIOLATION: "Violação de política",
  BUDGET_EXCEEDED: "Orçamento excedido",
  INSUFFICIENT_PERMISSIONS: "Permissões insuficientes",

  // File Upload
  FILE_TOO_LARGE: "Arquivo muito grande",
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido",
  FILE_UPLOAD_FAILED: "Falha no upload do arquivo",
  FILE_NOT_FOUND: "Arquivo não encontrado",

  // Network
  CONNECTION_ERROR: "Erro de conexão",
  SERVER_ERROR: "Erro interno do servidor",
  SERVICE_UNAVAILABLE: "Serviço indisponível",

  // General
  OPERATION_FAILED: "Operação falhou",
  RESOURCE_CONFLICT: "Conflito de recurso",
  INVALID_REQUEST: "Requisição inválida",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: "Login realizado com sucesso",
  LOGOUT_SUCCESS: "Logout realizado com sucesso",
  PASSWORD_RESET_SENT: "Email de redefinição de senha enviado",
  PASSWORD_CHANGED: "Senha alterada com sucesso",

  // CRUD Operations
  CREATED_SUCCESS: "Criado com sucesso",
  UPDATED_SUCCESS: "Atualizado com sucesso",
  DELETED_SUCCESS: "Excluído com sucesso",

  // Business Operations
  TRIP_SUBMITTED: "Viagem enviada para aprovação",
  TRIP_APPROVED: "Viagem aprovada com sucesso",
  TRIP_REJECTED: "Viagem rejeitada",
  EXPENSE_SUBMITTED: "Despesa enviada para aprovação",
  EXPENSE_APPROVED: "Despesa aprovada com sucesso",
  EXPENSE_REJECTED: "Despesa rejeitada",
  ADVANCE_APPROVED: "Adiantamento aprovado",
  REIMBURSEMENT_GENERATED: "Reembolso gerado com sucesso",

  // File Operations
  FILE_UPLOADED: "Arquivo enviado com sucesso",
  FILE_DELETED: "Arquivo excluído com sucesso",

  // Sync
  SYNC_COMPLETED: "Sincronização concluída",
  OFFLINE_DATA_SAVED: "Dados salvos offline",
} as const;

// Status Labels (for UI)
export const STATUS_LABELS = {
  [TripStatus.DRAFT]: "Rascunho",
  [TripStatus.PENDING_APPROVAL]: "Aguardando Aprovação",
  [TripStatus.APPROVED]: "Aprovada",
  [TripStatus.REJECTED]: "Rejeitada",
  [TripStatus.IN_PROGRESS]: "Em Andamento",
  [TripStatus.COMPLETED]: "Concluída",
  [TripStatus.ARCHIVED]: "Arquivada",

  [ExpenseStatus.DRAFT]: "Rascunho",
  [ExpenseStatus.SUBMITTED]: "Enviada",
  [ExpenseStatus.APPROVED]: "Aprovada",
  [ExpenseStatus.REJECTED]: "Rejeitada",
  [ExpenseStatus.ADJUSTED]: "Ajustada",
  [ExpenseStatus.REIMBURSED]: "Reembolsada",

  [AdvanceStatus.DRAFT]: "Rascunho",
  [AdvanceStatus.SUBMITTED]: "Enviado",
  [AdvanceStatus.APPROVED]: "Aprovado",
  [AdvanceStatus.REJECTED]: "Rejeitado",
  [AdvanceStatus.PAID]: "Pago",

  [UserRole.ADMIN]: "Administrador",
  [UserRole.MANAGER]: "Gestor",
  [UserRole.COLLABORATOR]: "Colaborador",
} as const;

// Category Labels
export const CATEGORY_LABELS = {
  [ExpenseCategory.ACCOMMODATION]: "Hospedagem",
  [ExpenseCategory.FOOD]: "Alimentação",
  [ExpenseCategory.TRANSPORT]: "Transporte",
  [ExpenseCategory.FUEL]: "Combustível",
  [ExpenseCategory.PARKING]: "Estacionamento",
  [ExpenseCategory.TOLL]: "Pedágio",
  [ExpenseCategory.OTHER]: "Outros",
} as const;

// Currency Labels
export const CURRENCY_LABELS = {
  [Currency.BRL]: "Real Brasileiro",
  [Currency.USD]: "Dólar Americano",
  [Currency.EUR]: "Euro",
  [Currency.GBP]: "Libra Esterlina",
  [Currency.JPY]: "Iene Japonês",
} as const;

// Period Labels
export const PERIOD_LABELS = {
  [BudgetPeriod.YEARLY]: "Anual",
  [BudgetPeriod.QUARTERLY]: "Trimestral",
  [BudgetPeriod.MONTHLY]: "Mensal",
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Date Formats
export const DATE_FORMATS = {
  BRAZILIAN: "dd/MM/yyyy",
  BRAZILIAN_WITH_TIME: "dd/MM/yyyy HH:mm",
  ISO: "yyyy-MM-dd",
  ISO_WITH_TIME: "yyyy-MM-dd HH:mm:ss",
  MONTH_YEAR: "MM/yyyy",
  FRIENDLY: "dd 'de' MMMM 'de' yyyy",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile:${userId}`,
  USER_TENANTS: (userId: string) => `user_tenants:${userId}`,
  TENANT_POLICIES: (tenantId: string) => `tenant_policies:${tenantId}`,
  TENANT_BUDGETS: (tenantId: string, year: number) =>
    `tenant_budgets:${tenantId}:${year}`,
  EXCHANGE_RATES: (date: string) => `exchange_rates:${date}`,
  EXPENSE_SUMMARY: (userId: string, month: string) =>
    `expense_summary:${userId}:${month}`,
} as const;

// Event Names (for EventEmitter)
export const EVENTS = {
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  TRIP_CREATED: "trip.created",
  TRIP_SUBMITTED: "trip.submitted",
  TRIP_APPROVED: "trip.approved",
  TRIP_REJECTED: "trip.rejected",
  TRIP_COMPLETED: "trip.completed",

  EXPENSE_CREATED: "expense.created",
  EXPENSE_SUBMITTED: "expense.submitted",
  EXPENSE_APPROVED: "expense.approved",
  EXPENSE_REJECTED: "expense.rejected",
  EXPENSE_ADJUSTED: "expense.adjusted",

  ADVANCE_CREATED: "advance.created",
  ADVANCE_SUBMITTED: "advance.submitted",
  ADVANCE_APPROVED: "advance.approved",
  ADVANCE_REJECTED: "advance.rejected",

  REIMBURSEMENT_GENERATED: "reimbursement.generated",
  REIMBURSEMENT_PAID: "reimbursement.paid",

  POLICY_VIOLATION: "policy.violation",
  BUDGET_EXCEEDED: "budget.exceeded",

  FILE_UPLOADED: "file.uploaded",
  FILE_DELETED: "file.deleted",

  NOTIFICATION_SENT: "notification.sent",
  EMAIL_SENT: "email.sent",
} as const;

// Queue Names (for job processing)
export const QUEUES = {
  EMAIL: "email-queue",
  NOTIFICATION: "notification-queue",
  FILE_PROCESSING: "file-processing-queue",
  SYNC: "sync-queue",
  REPORT_GENERATION: "report-generation-queue",
  AUDIT: "audit-queue",
} as const;

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  CURRENCY: Currency.BRL,
  TIMEZONE: "America/Sao_Paulo",
  LOCALE: "pt-BR",
  THEME: "light",

  // Business defaults
  MILEAGE_RATE: 1.2, // R$ per km
  MEAL_PER_DIEM: 50.0, // R$ per day

  // File upload
  MAX_FILES_PER_EXPENSE: 5,

  // Notification preferences
  EMAIL_NOTIFICATIONS: true,
  PUSH_NOTIFICATIONS: true,

  // Sync settings
  AUTO_SYNC: true,
  SYNC_INTERVAL: 15, // minutes
} as const;
