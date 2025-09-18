import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FxService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async convertToBrl(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'BRL') {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency);
    return amount / rate; // Convert to BRL
  }

  async getExchangeRate(currency: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to get today's rate
    let fxRate = await this.prisma.fxRate.findFirst({
      where: {
        currency,
        date: today,
      },
    });

    // If not found, get the most recent rate
    if (!fxRate) {
      fxRate = await this.prisma.fxRate.findFirst({
        where: { currency },
        orderBy: { date: 'desc' },
      });
    }

    // If still not found, use default rates
    if (!fxRate) {
      const defaultRates = {
        USD: 5.50,
        EUR: 6.00,
        GBP: 7.00,
      };
      return defaultRates[currency] || 1;
    }

    return fxRate.rate.toNumber();
  }

  async syncRates(): Promise<void> {
    // In a real implementation, you would call an external API here
    // For demo purposes, we'll create some mock rates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rates = [
      { currency: 'USD', rate: 5.50 },
      { currency: 'EUR', rate: 6.00 },
      { currency: 'GBP', rate: 7.00 },
    ];

    for (const rateData of rates) {
      await this.prisma.fxRate.upsert({
        where: {
          date_currency: {
            date: today,
            currency: rateData.currency,
          },
        },
        update: {
          rate: rateData.rate,
        },
        create: {
          date: today,
          currency: rateData.currency,
          rate: rateData.rate,
        },
      });
    }
  }
}