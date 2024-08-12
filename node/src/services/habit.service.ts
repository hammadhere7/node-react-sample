import { In, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Trait } from 'src/entities/trait.entity';
import { TraitCreate } from 'src/dtos/create-trait.dto';
import { Args } from '@nestjs/graphql';
import { ListArgs } from '../../common/types/list.args';
import { ArgsListService } from '../utils/typeOrm-helper';
import { TraitDetailOutput, TraitListByPillars } from '../dtos/trait-detail.dto';
import { TraitTranslationInput } from '../dtos/trait-translation.dto';
import { TraitUpdate } from 'src/dtos/update-trait.dto';
import { UserType } from 'shared/enums/user-type.enum';
import { PillarEvents } from 'shared/events/pillar.events';
import { SharedPillar } from 'shared/models/shared-pillar.model';
import { ProgressEvents } from 'shared/events/progress.events';
import { translateData } from 'common/utils/helpers';
import { MeasurementType } from 'shared/types/relational-types.output';
import { PostgresDbService } from 'common/services/postgres-db.service';
import { userTraitService } from './user-trait.service';

@Injectable()
export class TraitService extends PostgresDbService<Trait> {
  constructor(
    @InjectRepository(Trait)
    private argsListService: ArgsListService,
    private pillarEvents: PillarEvents,
    private progressEvents: ProgressEvents,

    @Inject(forwardRef(() => userTraitService))
    private readonly userTraitsService: userTraitService,
  ) {
    super(Trait.name);
  }

  async create(trait: TraitCreate): Promise<TraitDetailOutput> {
    return await this.repository.save(trait);
  }

  async getAllTraits(@Args() args?: ListArgs, language?: string) {
    this.argsListService.searchableColumns = ['title'];
    const filterQuery = this.argsListService.filterCondition(args);
    filterQuery.condition['deletedAt'] = IsNull();

    const [data, total] = await this.repository.findAndCount({
      where: filterQuery.condition,
      ...filterQuery.query,
      order: {
        id: 'ASC',
      },
    });

    if (data) {
      const pillars: SharedPillar[] = await this.pillarEvents.getAllPillars();
      const units = await this.progressEvents.getMeasurementList();
      await this.mapPillars(data, pillars, language);
      await this.mapUnits(data, units, language);
    }

    return {
      data,
      total,
    };
  }

  async mapPillars(records: TraitDetailOutput[], pillars: SharedPillar[], language: string) {
    records.forEach((record) => {
      pillars.map((pillar) => {
        if (pillar.id === record.pillarId) record.pillar = translateData(pillar, language);
      });
    });

    return records;
  }

  async mapUnits(records: TraitDetailOutput[], units: MeasurementType[], language: string) {
    records.forEach((record) => {
      units.map((unit) => {
        if (unit.id === record.unitId) record.unit = translateData(unit, language);
      });
    });

    return records;
  }

  async setTraitTranslation(id: string, translationInput: TraitTranslationInput) {
    const trait = await this.repository.findOne({ where: { id } });

    if (!trait) throw new BadRequestException(`The trait with Id ${id} does not exist`);

    if (translationInput.translations) {
      const keys = Object.keys(translationInput.translations);
      const index = keys.indexOf(trait.language);
      if (index > -1)
        throw new BadRequestException(`The language ${trait.language} is already added as main language for the trait`);
    }

    if (Object.keys(translationInput.translations).length === 0) trait.translations = null;
    else trait.translations = translationInput.translations;
    await this.repository.update(id, trait);
    return await this.repository.findOne({ where: { id } });
  }

  async getSingleTrait(id: string, userType: string, language?: string): Promise<TraitDetailOutput> {
    const trait = await this.repository.findOne({
      where:
        userType === UserType.SuperAdmin ? { id, deletedAt: IsNull() } : { id, deletedAt: IsNull(), isActive: true },
    });

    if (!trait) throw new NotFoundException(`Trait does not exist for the given Id: ${id}`);

    let pillar = await this.pillarEvents.getPillarIfExist(trait.pillarId);
    let unit = await this.progressEvents.getMeasurement(trait.unitId);

    unit = translateData(unit, language);
    pillar = translateData(pillar, language);

    return {
      ...trait,
      pillar,
      unit,
    };
  }

  async updateTrait(id: string, updateObj: TraitUpdate, language?: string): Promise<TraitDetailOutput> {
    const trait = await this.repository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!trait) throw new NotFoundException(`No trait exists with the Id: ${id}`);

    const traitObj = await this.repository.save({ id, ...updateObj });
    let pillar = await this.pillarEvents.getPillarIfExist(trait.pillarId);
    let unit = await this.progressEvents.getMeasurement(trait.unitId);

    unit = translateData(unit, language);
    pillar = translateData(pillar, language);

    return {
      ...traitObj,
      pillar,
      unit,
    };
  }

  async deleteTrait(id: string) {
    const trait = await this.repository.findOneBy({ id });

    if (!trait) throw new NotFoundException(`Could not find trait with id: ${id}`);
    trait.deletedAt = new Date();
    return await this.repository.save(trait);
  }

  async toggleTraitStatus(id: string) {
    const trait = await this.repository.findOne({ where: { id, deletedAt: null } });
    if (!trait) {
      throw new NotFoundException(`Trait does not exist for the given Id: ${id}`);
    }
    const newStatus = !trait.isActive;
    trait.isActive = !trait.isActive;
    this.repository.save(trait);
    return newStatus;
  }

  async getTraitListByPillars(userId: string, language: string) {
    const pillars: SharedPillar[] = await this.pillarEvents.getAllPillars();
    const units = await this.progressEvents.getMeasurementList();

    const response = [];

    const userTraits = await this.userTraitsService.repository.find({
      where: {
        userId,
        status: true,
      },
    });

    const traits: TraitDetailOutput[] = await this.repository.find({
      where: {
        id: Not(In(userTraits.map((userTrait) => userTrait.traitId))),
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    for (let pillar of pillars) {
      pillar = translateData(pillar, language);
      const pillarObj = {
        pillarId: pillar.id,
        pillarTitle: pillar.title,
        traits: [],
      };
      traits.map((trait) => this.mapPillarAndUnitsTraits(trait, pillarObj, language, pillar, units));
      if (pillarObj.traits.length) response.push(pillarObj);
    }

    return response;
  }

  mapPillarAndUnitsTraits(
    trait: TraitDetailOutput,
    pillarObj: TraitListByPillars,
    language: string,
    pillar: SharedPillar,
    units: MeasurementType[],
  ) {
    if (trait.pillarId === pillar.id) {
      trait = translateData(trait, language);
      pillarObj.traits.push(trait);
      trait.pillar = pillar;

      units.map((unit) => {
        if (trait.unitId === unit.id) trait.unit = translateData(unit, language);
      });
    }
  }

  async getTraitByPillarId(pillarId: string) {
    return await this.repository.findOne({ where: { pillarId } });
  }

  async getTraitByUnitId(unitId: string) {
    return await this.repository.findOne({ where: { unitId } });
  }
}
