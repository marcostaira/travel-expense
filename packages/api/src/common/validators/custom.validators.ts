import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

// CNPJ Validator
@ValidatorConstraint({ async: false })
export class IsCNPJConstraint implements ValidatorConstraintInterface {
  validate(cnpj: any, args: ValidationArguments) {
    if (typeof cnpj !== "string") return false;

    const cleaned = cnpj.replace(/\D/g, "");

    if (cleaned.length !== 14) return false;
    if (/^(.)\1*$/.test(cleaned)) return false; // All same digits

    // Calculate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cleaned.charAt(12)) !== checkDigit1) return false;

    // Calculate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return parseInt(cleaned.charAt(13)) === checkDigit2;
  }

  defaultMessage(args: ValidationArguments) {
    return "CNPJ inválido";
  }
}

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCNPJConstraint,
    });
  };
}

// CPF Validator
@ValidatorConstraint({ async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: any, args: ValidationArguments) {
    if (typeof cpf !== "string") return false;

    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length !== 11) return false;
    if (/^(.)\1*$/.test(cleaned)) return false; // All same digits

    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;

    if (parseInt(cleaned.charAt(9)) !== checkDigit1) return false;

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;

    return parseInt(cleaned.charAt(10)) === checkDigit2;
  }

  defaultMessage(args: ValidationArguments) {
    return "CPF inválido";
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}

// Currency Amount Validator
@ValidatorConstraint({ async: false })
export class IsCurrencyAmountConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== "number") return false;

    // Check if it's a valid number
    if (isNaN(value) || !isFinite(value)) return false;

    // Check if it's positive or zero
    if (value < 0) return false;

    // Check if it doesn't have more than 2 decimal places
    const decimalPlaces = (value.toString().split(".")[1] || "").length;
    return decimalPlaces <= 2;
  }

  defaultMessage(args: ValidationArguments) {
    return "Valor deve ser um número positivo com no máximo 2 casas decimais";
  }
}

export function IsCurrencyAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCurrencyAmountConstraint,
    });
  };
}

// Future Date Validator
@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;

    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    return date >= now;
  }

  defaultMessage(args: ValidationArguments) {
    return "Data deve ser hoje ou no futuro";
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

// Date Range Validator (end date after start date)
@ValidatorConstraint({ async: false })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;

    const endDate = new Date(value);
    if (isNaN(endDate.getTime())) return false;

    const startDateProperty = args.constraints[0];
    const startDate = new Date((args.object as any)[startDateProperty]);

    if (isNaN(startDate.getTime())) return false;

    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    const startDateProperty = args.constraints[0];
    return `${args.property} deve ser posterior a ${startDateProperty}`;
  }
}

export function IsAfterDate(
  startDateProperty: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [startDateProperty],
      validator: IsAfterDateConstraint,
    });
  };
}

// Brazilian Phone Validator
@ValidatorConstraint({ async: false })
export class IsBrazilianPhoneConstraint
  implements ValidatorConstraintInterface
{
  validate(phone: any, args: ValidationArguments) {
    if (typeof phone !== "string") return false;

    const cleaned = phone.replace(/\D/g, "");

    // Accept 10 or 11 digits (with or without mobile 9th digit)
    if (![10, 11].includes(cleaned.length)) return false;

    // Check area code (first 2 digits should be valid Brazilian area codes)
    const areaCode = parseInt(cleaned.substring(0, 2));
    const validAreaCodes = [
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19, // SP
      21,
      22,
      24, // RJ
      27,
      28, // ES
      31,
      32,
      33,
      34,
      35,
      37,
      38, // MG
      41,
      42,
      43,
      44,
      45,
      46, // PR
      47,
      48,
      49, // SC
      51,
      53,
      54,
      55, // RS
      61, // DF/GO
      62,
      64, // GO
      63, // TO
      65,
      66, // MT
      67, // MS
      68, // AC
      69, // RO
      71,
      73,
      74,
      75,
      77, // BA
      79, // SE
      81,
      87, // PE
      82, // AL
      83, // PB
      84, // RN
      85,
      88, // CE
      86,
      89, // PI
      91,
      93,
      94, // PA
      92,
      97, // AM
      95, // RR
      96, // AP
      98,
      99, // MA
    ];

    return validAreaCodes.includes(areaCode);
  }

  defaultMessage(args: ValidationArguments) {
    return "Número de telefone brasileiro inválido";
  }
}

export function IsBrazilianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBrazilianPhoneConstraint,
    });
  };
}

// Strong Password Validator
@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: any, args: ValidationArguments) {
    if (typeof password !== "string") return false;

    // Minimum 8 characters
    if (password.length < 8) return false;

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) return false;

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // At least one digit
    if (!/\d/.test(password)) return false;

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    // No common patterns
    if (/(.)\1{2,}/.test(password)) return false; // No repeated characters
    if (/123456|abcdef|qwerty|password/i.test(password)) return false; // No common sequences

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo especial";
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// File Size Validator
@ValidatorConstraint({ async: false })
export class IsFileSizeValidConstraint implements ValidatorConstraintInterface {
  validate(file: any, args: ValidationArguments) {
    if (!file || typeof file !== "object") return false;

    const maxSize = args.constraints[0] || 10 * 1024 * 1024; // Default 10MB
    return file.size <= maxSize;
  }

  defaultMessage(args: ValidationArguments) {
    const maxSize = args.constraints[0] || 10 * 1024 * 1024;
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `Arquivo deve ter no máximo ${maxSizeMB}MB`;
  }
}

export function IsFileSizeValid(
  maxSize: number,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxSize],
      validator: IsFileSizeValidConstraint,
    });
  };
}
