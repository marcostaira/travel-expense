import { randomBytes } from "crypto";

export class StringUtil {
  /**
   * Generate random string
   */
  static generateRandom(length: number): string {
    return randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }

  /**
   * Generate UUID-like string
   */
  static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Slugify string (convert to URL-friendly format)
   */
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Capitalize each word
   */
  static capitalizeWords(text: string): string {
    if (!text) return text;
    return text.replace(/\w\S*/g, (word) => this.capitalize(word));
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  /**
   * Convert to snake_case
   */
  static toSnakeCase(text: string): string {
    return text
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  }

  /**
   * Convert to kebab-case
   */
  static toKebabCase(text: string): string {
    return text
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("-");
  }

  /**
   * Remove accents from string
   */
  static removeAccents(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(text: string, maxLength: number, suffix = "..."): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Mask string (e.g., for sensitive data)
   */
  static mask(text: string, visibleChars = 4, maskChar = "*"): string {
    if (text.length <= visibleChars) return text;
    const visible = text.slice(-visibleChars);
    const masked = maskChar.repeat(text.length - visibleChars);
    return masked + visible;
  }

  /**
   * Mask email
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split("@");
    if (!domain) return email;

    const maskedUsername =
      username.length > 2
        ? username.slice(0, 2) + "*".repeat(username.length - 2)
        : username;

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 8) return phone;

    const visibleStart = cleaned.slice(0, 2);
    const visibleEnd = cleaned.slice(-2);
    const masked = "*".repeat(cleaned.length - 4);

    return visibleStart + masked + visibleEnd;
  }

  /**
   * Format CNPJ (Brazilian tax ID)
   */
  static formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, "");
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  /**
   * Format CPF (Brazilian personal ID)
   */
  static formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate CNPJ
   */
  static isValidCNPJ(cnpj: string): boolean {
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

  /**
   * Generate password
   */
  static generatePassword(
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = false
  ): string {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    level: "weak" | "fair" | "good" | "strong";
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push("Use pelo menos 8 caracteres");

    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Inclua letras minúsculas");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Inclua letras maiúsculas");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("Inclua números");

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push("Inclua símbolos especiais");

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push("Evite repetir caracteres");

    const levels: Array<"weak" | "fair" | "good" | "strong"> = [
      "weak",
      "fair",
      "good",
      "strong",
    ];
    const levelIndex = Math.min(Math.floor(score / 2), 3);

    return {
      score,
      level: levels[levelIndex],
      feedback,
    };
  }

  /**
   * Extract file extension
   */
  static getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  /**
   * Get filename without extension
   */
  static getFilenameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "");
  }

  /**
   * Sanitize filename for file system
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  /**
   * Count words in text
   */
  static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Escape HTML characters
   */
  static escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate initials from name
   */
  static getInitials(name: string, maxInitials = 2): string {
    return name
      .split(" ")
      .filter((word) => word.length > 0)
      .slice(0, maxInitials)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }

  /**
   * Check if string contains only numbers
   */
  static isNumeric(text: string): boolean {
    return /^\d+$/.test(text);
  }

  /**
   * Format phone number
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 10) {
      // (xx) xxxx-xxxx
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 11) {
      // (xx) xxxxx-xxxx
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return phone;
  }
}
