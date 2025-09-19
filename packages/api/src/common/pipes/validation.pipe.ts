import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform to the correct types
      dismissDefaultMessages: false,
      validationError: {
        target: false, // Don't include target object in error
        value: false, // Don't include value in error
      },
    });

    if (errors.length > 0) {
      const messages = this.buildErrorMessage(errors);
      throw new BadRequestException({
        message: messages,
        error: "ValidationError",
        statusCode: 400,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private buildErrorMessage(errors: any[]): string[] {
    const messages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          messages.push(message as string);
        });
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedMessages = this.buildErrorMessage(error.children);
        messages.push(...nestedMessages);
      }
    });

    return messages;
  }
}
