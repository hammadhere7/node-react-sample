import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from 'common/config/typeorm.config';
import { CommonModule } from 'common/modules/common.module';
import config from 'config';
import { Trait } from './entities/trait.entity';
import { TraitResolver } from './resolvers/trait.resolvers';
import { TraitService } from './services/trait.service';
import { ArgsListService } from './utils/typeOrm-helper';
import { PillarEvents } from 'shared/events/pillar.events';
import { UserTrait } from './entities/user-trait.entity';
import { UserTraitResolver } from './resolvers/user-trait.resolvers';
import { UserTraitService } from './services/user-trait.service';
import { ProgressEvents } from 'shared/events/progress.events';
import { TraitCompletion } from './entities/trait-completion.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PointsStatus } from './entities/points-status.entity';
import { LoyaltyEvents } from 'shared/events/loyalty.events';
import { RegionalDbModule } from 'common/modules/regional-db.module';
import { TraitCompletionService } from './services/completion.service';
import { PointsStatusService } from './services/points.service';

@Module({
  imports: [
    CommonModule.forGql(config, TypeOrmConfigService, [], { producer: true, consumer: true }),
    RegionalDbModule.registerTypeOrm([Trait, UserTrait, TraitCompletion, PointsStatus]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    TraitResolver,
    TraitService,
    TraitCompletionService,
    PointsStatusService,
    ArgsListService,
    UserTraitResolver,
    UserTraitService,
    PillarEvents,
    ProgressEvents,
    LoyaltyEvents,
  ],
})
export class ApiModule {}
