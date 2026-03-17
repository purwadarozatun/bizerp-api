import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrencyService } from './currency.service';

@ApiTags('accounting/currencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/currencies')
export class CurrencyController {
  constructor(private readonly currency: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'List supported currencies and their USD rates' })
  list() {
    return this.currency.getSupportedCurrencies();
  }

  @Get('rate')
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  rate(@Body() body: { from: string; to: string }) {
    const rate = this.currency.getRate(body.from, body.to);
    return { from: body.from, to: body.to, rate };
  }

  @Post('rate')
  @ApiOperation({ summary: 'Update exchange rate (USD base)' })
  setRate(@Body() body: { currency: string; rateToUsd: number }) {
    return this.currency.setRate(body.currency, body.rateToUsd);
  }
}
