import { Module } from '@nestjs/common';
import { AdvancesController } from './advances.controller';
import { AdvancesService } from './advances.service';

@Module({
  controllers: [AdvancesController],
  providers: [AdvancesService],
  exports: [AdvancesService],
})
export class AdvancesModule {}