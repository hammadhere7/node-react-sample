import { Field, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { SharedPillar } from 'shared/models/shared-pillar.model';
import { Trait } from 'src/entities/trait.entity';

@ObjectType()
export class Unit {
  @Field()
  id: string;

  @Field()
  unit: string;

  @Field()
  description: string;
}

@ObjectType()
export class TraitDetailOutput extends PartialType(
  PickType(Trait, [
    'id',
    'title',
    'description',
    'language',
    'repetition',
    'translations',
    'target',
    'isActive',
    'createdAt',
    'updatedAt',
  ]),
) {
  @Field()
  pillar?: SharedPillar;

  @Field()
  unit?: Unit;
}

@ObjectType()
export class TraitListOutput {
  @Field(() => [TraitDetailOutput])
  data: TraitDetailOutput[];

  @Field()
  total: number;
}

@ObjectType()
export class TraitListByPillars {
  @Field()
  pillarId?: string;

  @Field()
  pillarTitle?: string;

  @Field(() => [TraitDetailOutput])
  traits: TraitDetailOutput[];
}
