import { Module } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { ChampionsController } from './champions.controller';
import { HttpModule } from '@nestjs/axios';
import { ChampionsMapper } from './champions.mapper';
import { ChampionsRepository } from './champions.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [ChampionsService, ChampionsMapper, ChampionsRepository],
  controllers: [ChampionsController],
  exports: [ChampionsMapper, ChampionsRepository],
})
export class ChampionsModule {}
