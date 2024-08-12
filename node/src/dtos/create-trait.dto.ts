import { InputType, PickType } from '@nestjs/graphql';

import { Trait } from 'src/entities/trait.entity';

@InputType()
export class TraitCreate extends PickType(
  Trait,
  ['title', 'description', 'language', 'target', 'repetition', 'pillarId', 'unitId'],
  InputType,
) {}
