import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { FilesModule } from '../files/files.module';
import { PoliciesModule } from '../policies/policies.module';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [FilesModule, PoliciesModule, FxModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}