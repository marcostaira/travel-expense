import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FxService } from './fx.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Câmbio')
@ApiBearerAuth('jwt')
@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('convert')
  @ApiOperation({ summary: 'Converter moeda para BRL' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Valor a converter' })
  @ApiQuery({ name: 'from', type: String, description: 'Moeda de origem' })
  async convert(@Query('amount') amount: number, @Query('from') from: string) {
    const convertedAmount = await this.fxService.convertToBrl(amount, from);
    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount,
      convertedCurrency: 'BRL',
    };
  }

  @Get('rates')
  @ApiOperation({ summary: 'Obter taxas de câmbio' })
  @ApiQuery({ name: 'currency', type: String, description: 'Moeda específica (opcional)' })
  async getRates(@Query('currency') currency?: string) {
    if (currency) {
      const rate = await this.fxService.getExchangeRate(currency);
      return { currency, rate };
    }

    // Return all available rates
    const currencies = ['USD', 'EUR', 'GBP'];
    const rates = await Promise.all(
      currencies.map(async (curr) => ({
        currency: curr,
        rate: await this.fxService.getExchangeRate(curr),
      }))
    );

    return rates;
  }

  @Post('sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Sincronizar taxas de câmbio' })
  async syncRates() {
    await this.fxService.syncRates();
    return { message: 'Taxas sincronizadas com sucesso' };
  }
}