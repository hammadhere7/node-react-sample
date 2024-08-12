import { Injectable } from '@nestjs/common';

import { PostgresDbService } from 'common/services/postgres-db.service';
import { TraitCompletion } from 'src/entities/trait-completion.entity';

@Injectable()
export class TraitCompletionService extends PostgresDbService<TraitCompletion> {
  constructor() {
    super(TraitCompletion.name);
  }
}
