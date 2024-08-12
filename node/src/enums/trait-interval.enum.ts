import { registerEnumType } from '@nestjs/graphql';

export enum TraitIntervals {
  Daily = 'Daily',
}

registerEnumType(TraitIntervals, { name: 'TraitIntervals' });
