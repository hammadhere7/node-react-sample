import { Field, HideField, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { UserTrait } from 'src/entities/user-trait.entity';
import { TraitDetailOutput } from './trait-detail.dto';
import { Trait } from 'src/entities/trait.entity';
import { TraitCompletionOutput } from './completion-filter.dto';

@ObjectType()
export class UserTraitOutput extends PartialType(PickType(UserTrait, ['id', 'streak', 'dateStarted'])) {
  @Field({ defaultValue: false })
  completed?: boolean;

  @HideField()
  trait?: Trait;

  @Field(() => TraitDetailOutput)
  traitDetail?: TraitDetailOutput;

  @Field(() => [TraitCompletionOutput])
  completionHistory?: TraitCompletionOutput[];
}

@ObjectType()
export class UserTraitList {
  @Field()
  pillarId?: string;

  @Field()
  pillarTitle?: string;

  @Field(() => [UserTraitOutput])
  userTraits: UserTraitOutput[];
}
