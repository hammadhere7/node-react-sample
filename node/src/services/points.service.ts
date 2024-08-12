import { Injectable } from '@nestjs/common';

import { PostgresDbService } from 'common/services/postgres-db.service';
import { PointsStatus } from 'src/entities/points-status.entity';

@Injectable()
export class PointsStatusService extends PostgresDbService<PointsStatus> {
  constructor() {
    super(PointsStatus.name);
  }
}
