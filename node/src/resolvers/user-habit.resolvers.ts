import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from 'common/guards/jwt.guard';
import { UserTypes } from 'common/decorators/user-types.decorator';
import { UserType } from 'shared/enums/user-type.enum';
import { Id } from 'common/decorators/id-input.decorator';
import { userTraitService } from 'src/services/user-trait.service';
import { Uid } from 'common/decorators/user-id.decorator';
import { userTrait } from 'src/entities/user-trait.entity';
import { userTraitList, userTraitOutput } from 'src/dtos/user-trait.dto';
import { Query } from '@nestjs/graphql';
import { Lang } from 'common/decorators/language.decorator';
import { CompletionFilter, TraitCompletionOutput } from 'src/dtos/completion-filter.dto';
import { Timezone } from 'common/decorators/timezone.decorator';
import * as moment from 'moment-timezone';
import { getZoneFromOffset } from 'common/utils/helpers';

@JwtGuard()
@Resolver(() => userTrait)
export class userTraitResolver {
  constructor(private service: userTraitService) {}

  @UserTypes(UserType.Employee)
  @Mutation(() => Boolean)
  startTrait(@Uid() userId: string, @Id('traitId') traitId: string) {
    return this.service.startTrait(traitId, userId);
  }

  @UserTypes(UserType.Employee)
  @Query(() => [userTraitList])
  getuserTraits(@Uid() userId, @Lang() language, @Args('dateFilter') date: Date, @Timezone() timeZone) {
    timeZone = getZoneFromOffset(timeZone);
    return this.service.getAlluserTraits(userId, language, date, timeZone);
  }

  @UserTypes(UserType.Employee)
  @Query(() => userTraitOutput)
  getuserTraitDetail(@Args('id') traitId: string, @Uid() userId, @Lang() language, @Timezone() timeZone) {
    timeZone = getZoneFromOffset(timeZone);
    return this.service.getSingleuserTrait(traitId, userId, language, timeZone);
  }

  @UserTypes(UserType.Employee)
  @Query(() => Boolean)
  isTraitEnrolled(@Args('id') traitId: string, @Uid() userId) {
    return this.service.isTraitEntrolled(traitId, userId);
  }

  @UserTypes(UserType.Employee)
  @Mutation(() => Boolean)
  toggleTraitCompletion(@Args('traitId') traitId: string, @Uid() userId, @Timezone() timeZone) {
    timeZone = getZoneFromOffset(timeZone);

    return this.service.toggleTraitCompletion(traitId, userId, timeZone);
  }

  @UserTypes(UserType.Employee)
  @Query(() => [TraitCompletionOutput])
  getTraitCompletions(
    @Args('completionFilter') completionFilter: CompletionFilter,
    @Uid() userId: string,
    @Timezone() timeZone,
  ) {
    timeZone = getZoneFromOffset(timeZone);
    return this.service.getTraitCompletions(completionFilter, userId, timeZone);
  }

  @UserTypes(UserType.Employee)
  @Mutation(() => Boolean)
  removeTraitEnrolment(@Args('traitId') traitId: string, @Uid() userId) {
    return this.service.removeTraitEnrolment(traitId, userId);
  }
}
