import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from 'common/guards/jwt.guard';
import { UserTypes } from 'common/decorators/user-types.decorator';
import { UserType } from 'shared/enums/user-type.enum';
import { Trait } from 'src/entities/trait.entity';
import { TraitService } from 'src/services/trait.service';
import { TraitCreate } from 'src/dtos/create-trait.dto';
import { IdOutput } from 'common/types/outputs/id.output';
import { Query } from '@nestjs/graphql';
import { ListArgs } from 'common/types/list.args';
import { TraitDetailOutput, TraitListByPillars, TraitListOutput } from 'src/dtos/trait-detail.dto';
import { Id } from 'common/decorators/id-input.decorator';
import { TraitTranslationInput } from '../dtos/trait-translation.dto';
import { TraitUpdate } from 'src/dtos/update-trait.dto';
import { UserProp } from 'common/decorators/user-prop.decorator';
import { JwtPayload } from 'shared/types/auth/jwt-payload';
import { Lang } from 'common/decorators/language.decorator';

@JwtGuard()
@Resolver(() => Trait)
export class TraitResolver {
  constructor(private service: TraitService) {}

  @UserTypes(UserType.SuperAdmin)
  @Mutation(() => IdOutput)
  createTrait(@Args('trait') trait: TraitCreate) {
    return this.service.create(trait);
  }

  @UserTypes(UserType.SuperAdmin)
  @Query(() => TraitListOutput)
  getAllTraits(@Args() args?: ListArgs, @Lang() language?) {
    return this.service.getAllTraits(args, language);
  }

  @UserTypes(UserType.SuperAdmin)
  @Mutation(() => TraitDetailOutput)
  setTraitTranslation(@Id() id: string, @Args('translationInput') translationInput: TraitTranslationInput) {
    return this.service.setTraitTranslation(id, translationInput);
  }

  @UserTypes(UserType.SuperAdmin, UserType.Employee)
  @Query(() => TraitDetailOutput)
  getTraitById(@Args('id') id: string, @UserProp() user: JwtPayload, @Lang() language?) {
    return this.service.getSingleTrait(id, user.userType, language);
  }

  @UserTypes(UserType.SuperAdmin)
  @Mutation(() => TraitDetailOutput)
  async updateTrait(@Id() id: string, @Args('updateObj') updateObj: TraitUpdate, @Lang() language?) {
    return await this.service.updateTrait(id, updateObj, language);
  }

  @UserTypes(UserType.SuperAdmin)
  @Mutation(() => TraitDetailOutput)
  deleteTrait(@Id('id') id: string) {
    return this.service.deleteTrait(id);
  }

  @UserTypes(UserType.SuperAdmin)
  @Mutation(() => Boolean)
  async toggleTraitStatus(@Args('id') id: string) {
    return await this.service.toggleTraitStatus(id);
  }

  @UserTypes(UserType.Employee)
  @Query(() => [TraitListByPillars])
  getTraitListByPillars(@UserProp() user: JwtPayload, @Lang() language: string) {
    return this.service.getTraitListByPillars(user.id, language);
  }

  @UserTypes(UserType.SuperAdmin)
  @Query(() => Trait)
  getTraitByPillarId(@Args('pillarId') pillarId: string) {
    return this.service.getTraitByPillarId(pillarId);
  }

  @UserTypes(UserType.SuperAdmin)
  @Query(() => Trait)
  getTraitByUnitId(@Args('unitId') unitId: string) {
    return this.service.getTraitByUnitId(unitId);
  }
}
