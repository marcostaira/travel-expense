import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  differenceInHours,
  isValid,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export class DateUtil {
  private static readonly TIMEZONE = "America/Sao_Paulo";
  private static readonly LOCALE = ptBR;

  /**
   * Get current date in São Paulo timezone
   */
  static now(): Date {
    return utcToZonedTime(new Date(), this.TIMEZONE);
  }

  /**
   * Convert UTC date to São Paulo timezone
   */
  static toLocalTime(date: Date): Date {
    return utcToZonedTime(date, this.TIMEZONE);
  }

  /**
   * Convert São Paulo timezone date to UTC
   */
  static toUtc(date: Date): Date {
    return zonedTimeToUtc(date, this.TIMEZONE);
  }

  /**
   * Format date to Brazilian format
   */
  static formatToBrazilian(date: Date, pattern = "dd/MM/yyyy"): string {
    const localDate = this.toLocalTime(date);
    return format(localDate, pattern, {
      timeZone: this.TIMEZONE,
      locale: this.LOCALE,
    });
  }

  /**
   * Format date to Brazilian date-time format
   */
  static formatToDateTime(date: Date): string {
    return this.formatToBrazilian(date, "dd/MM/yyyy HH:mm");
  }

  /**
   * Parse ISO string to date
   */
  static parseISOString(dateString: string): Date {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return date;
  }

  /**
   * Get start of day in local timezone
   */
  static startOfDay(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const startDay = startOfDay(localDate);
    return this.toUtc(startDay);
  }

  /**
   * Get end of day in local timezone
   */
  static endOfDay(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const endDay = endOfDay(localDate);
    return this.toUtc(endDay);
  }

  /**
   * Get start of month in local timezone
   */
  static startOfMonth(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const startMonth = startOfMonth(localDate);
    return this.toUtc(startMonth);
  }

  /**
   * Get end of month in local timezone
   */
  static endOfMonth(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const endMonth = endOfMonth(localDate);
    return this.toUtc(endMonth);
  }

  /**
   * Get start of year in local timezone
   */
  static startOfYear(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const startYear = startOfYear(localDate);
    return this.toUtc(startYear);
  }

  /**
   * Get end of year in local timezone
   */
  static endOfYear(date: Date): Date {
    const localDate = this.toLocalTime(date);
    const endYear = endOfYear(localDate);
    return this.toUtc(endYear);
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, amount: number): Date {
    return addDays(date, amount);
  }

  /**
   * Add months to date
   */
  static addMonths(date: Date, amount: number): Date {
    return addMonths(date, amount);
  }

  /**
   * Add years to date
   */
  static addYears(date: Date, amount: number): Date {
    return addYears(date, amount);
  }

  /**
   * Get difference in days
   */
  static differenceInDays(dateLeft: Date, dateRight: Date): number {
    return differenceInDays(dateLeft, dateRight);
  }

  /**
   * Get difference in hours
   */
  static differenceInHours(dateLeft: Date, dateRight: Date): number {
    return differenceInHours(dateLeft, dateRight);
  }

  /**
   * Check if date is valid
   */
  static isValid(date: Date): boolean {
    return isValid(date);
  }

  /**
   * Get date range for period
   */
  static getDateRangeForPeriod(
    year: number,
    period: "YEARLY" | "QUARTERLY" | "MONTHLY",
    quarter?: number,
    month?: number
  ): { startDate: Date; endDate: Date } {
    const baseDate = new Date(year, 0, 1); // January 1st of the year

    switch (period) {
      case "YEARLY":
        return {
          startDate: this.startOfYear(baseDate),
          endDate: this.endOfYear(baseDate),
        };

      case "QUARTERLY":
        if (!quarter || quarter < 1 || quarter > 4) {
          throw new Error("Quarter must be between 1 and 4");
        }
        const quarterStartMonth = (quarter - 1) * 3;
        const quarterDate = new Date(year, quarterStartMonth, 1);
        return {
          startDate: this.startOfMonth(quarterDate),
          endDate: this.endOfMonth(this.addMonths(quarterDate, 2)),
        };

      case "MONTHLY":
        if (!month || month < 1 || month > 12) {
          throw new Error("Month must be between 1 and 12");
        }
        const monthDate = new Date(year, month - 1, 1);
        return {
          startDate: this.startOfMonth(monthDate),
          endDate: this.endOfMonth(monthDate),
        };

      default:
        throw new Error("Invalid period type");
    }
  }

  /**
   * Check if date is in business hours (9 AM to 6 PM)
   */
  static isBusinessHours(date: Date): boolean {
    const localDate = this.toLocalTime(date);
    const hour = localDate.getHours();
    return hour >= 9 && hour < 18;
  }

  /**
   * Check if date is weekend
   */
  static isWeekend(date: Date): boolean {
    const localDate = this.toLocalTime(date);
    const day = localDate.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Get next business day
   */
  static getNextBusinessDay(date: Date): Date {
    let nextDay = this.addDays(date, 1);
    while (this.isWeekend(nextDay)) {
      nextDay = this.addDays(nextDay, 1);
    }
    return nextDay;
  }

  /**
   * Get age in years
   */
  static getAgeInYears(
    birthDate: Date,
    referenceDate: Date = this.now()
  ): number {
    const localBirth = this.toLocalTime(birthDate);
    const localRef = this.toLocalTime(referenceDate);

    let age = localRef.getFullYear() - localBirth.getFullYear();
    const monthDiff = localRef.getMonth() - localBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && localRef.getDate() < localBirth.getDate())
    ) {
      age--;
    }

    return age;
  }
}
