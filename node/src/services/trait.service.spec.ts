import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TraitService } from './trait.service';
import { Trait } from 'src/entities/trait.entity';
import { TraitCreate } from 'src/dtos/create-trait.dto';
import { faker } from '@faker-js/faker/locale/af_ZA';
import { v4 as uuidv4 } from 'uuid';
import { Language } from 'shared/enums/language.enum';
import { TraitIntervals } from 'src/enums/trait-interval.enum';
import { ArgsListService } from 'src/utils/typeOrm-helper';
import { TraitTranslationInput } from 'src/dtos/trait-translation.dto';
import { UserTrait } from 'src/entities/user-trait.entity';
import { PillarEvents } from 'shared/events/pillar.events';
import { ProgressEvents } from 'shared/events/progress.events';
import { userTraitService } from './user-trait.service';
import { PostgresDbService } from 'common/services/postgres-db.service';
import { RegionalDbModule } from 'common/modules/regional-db.module';
import config from '../../config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmConfigService } from 'common/config/typeorm.config';
import { CommonModule } from '../../common/modules/common.module';
import { TraitCompletion } from '../entities/trait-completion.entity';
import { PointsStatus } from '../entities/points-status.entity';

describe('TraitService', () => {
  let service: TraitService;
  let userTraitService: userTraitService;
  const repository = {
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const pillarEvents = {
    getAllPillars: jest.fn(),
    getPillarIfExist: jest.fn(),
  };
  const progressEvents = {
    getMeasurementList: jest.fn(),
    getMeasurement: jest.fn(),
  };

  const userTraitsRepo = {
    find: jest.fn(),
  };

  const userTraitsService = {
    repository: userTraitsRepo,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule.forGql(config, TypeOrmConfigService, [], { producer: true, consumer: true }),
        RegionalDbModule.registerTypeOrm([Trait, userTrait, TraitCompletion, PointsStatus]),
        ScheduleModule.forRoot(),
      ],
      providers: [
        TraitService,
        ArgsListService,
        {
          provide: PostgresDbService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Trait),
          useValue: repository,
        },
        {
          provide: PillarEvents,
          useValue: pillarEvents as unknown as jest.Mocked<PillarEvents>,
        },
        {
          provide: ProgressEvents,
          useValue: progressEvents as unknown as jest.Mocked<ProgressEvents>,
        },
        {
          provide: getRepositoryToken(userTrait),
          useValue: userTraitsRepo,
        },
        {
          provide: userTraitService,
          useValue: userTraitsService as unknown as jest.Mocked<userTraitService>,
        },
      ],
    }).compile();

    service = module.get<TraitService>(TraitService);
    userTraitService = module.get<userTraitService>(userTraitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Trait Create', () => {
    it('should create the trait successfully', async () => {
      const trait: TraitCreate = {
        title: faker.word.noun(),
        description: faker.lorem.paragraph(),
        language: Language.Arabic,
        pillarId: uuidv4(),
        unitId: uuidv4(),
        repetition: TraitIntervals.Daily,
        target: 1000,
      };

      jest.spyOn(repository, 'save').mockResolvedValue({ id: uuidv4(), isActive: true, ...trait });

      const savedTrait = await service.create(trait);
      expect(savedTrait.id).toBeDefined();
      expect(savedTrait.isActive).toBeTruthy();
      expect(savedTrait.title).toEqual(trait.title);
      expect(savedTrait.description).toEqual(trait.description);
      expect(savedTrait.unitId).toEqual(trait.unitId);
      expect(savedTrait.pillarId).toEqual(trait.pillarId);
    });
  });

  describe('Set Trait Translation', () => {
    let traitId;
    let translationInput: TraitTranslationInput;
    let trait: Partial<Trait>;
    beforeEach(() => {
      traitId = uuidv4();
      translationInput = {
        translations: {
          ar: {
            title: faker.word.noun(),
          },
        },
      };
      trait = {
        id: uuidv4(),
        title: faker.word.noun(),
        language: Language.English,
      };
    });

    it('should throw an error if trait does not exist for given Id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      expect(async () => {
        await service.setTraitTranslation(traitId, translationInput);
      }).rejects.toThrow();
    });
    it('should throw error if passed language is already the main language of trait', () => {
      const translationInputParam = {
        translations: {
          en: {
            title: faker.word.noun(),
          },
        },
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(trait);
      expect(async () => {
        await service.setTraitTranslation(traitId, translationInputParam);
      }).rejects.toThrow();
    });

    it('Should add the provided languages as translation of trait', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(trait);
      const updatedObj = {
        translations: translationInput.translations,
        ...trait,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(updatedObj);

      const traitObj = await service.setTraitTranslation(traitId, translationInput);

      expect(traitObj.title).toEqual(updatedObj.title);
      expect(translationInput.translations).toEqual(updatedObj.translations);
    });
  });

  describe('Trait Detail', () => {
    it('should not return trait that does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const getTraitById = async () => {
        return await service.getSingleTrait(uuidv4(), 'Employee');
      };
      expect(getTraitById()).rejects.toThrow();
    });

    it('should return trait by id', async () => {
      const trait = {
        id: uuidv4(),
        title: faker.word.noun(),
        language: Language.English,
        pillar: {
          id: uuidv4(),
          title: faker.word.noun(),
        },
        unit: {
          id: uuidv4(),
          uni: faker.word.noun(),
        },
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(trait);
      jest.spyOn(pillarEvents, 'getAllPillars').mockResolvedValue(trait.pillar);
      jest.spyOn(progressEvents, 'getMeasurementList').mockResolvedValue(trait.unit);
      const result = await service.getSingleTrait(trait.id, 'Employee');
      expect(result.title).toEqual(trait.title);
      expect(result.id).toEqual(trait.id);
    });
  });

  describe('Trait Update', () => {
    let traitParams;
    beforeEach(() => {
      traitParams = {
        id: uuidv4(),
        title: faker.word.noun(),
        language: Language.English,
        pillar: {
          id: uuidv4(),
          title: faker.word.noun(),
        },
        unit: {
          id: uuidv4(),
          uni: faker.word.noun(),
        },
      };
    });

    it('should throw exception for non-existend trait Id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      expect(async () => {
        await service.updateTrait(traitParams.id, traitParams);
      }).rejects.toThrow();
    });

    it('it should update the trait successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(traitParams);

      const updateObj = {
        title: faker.word.noun(),
        ...traitParams,
      };

      const updateTrait = { title: updateObj.title, ...traitParams };
      jest.spyOn(repository, 'save').mockResolvedValue(updateTrait);
      jest.spyOn(pillarEvents, 'getPillarIfExist').mockResolvedValue(updateTrait.pillar);
      jest.spyOn(progressEvents, 'getMeasurement').mockResolvedValue(updateTrait.unit);

      const update = await service.updateTrait(traitParams.id, updateObj);
      expect(update.title).toEqual(updateObj.title);
    });
  });

  describe('Trait Delete', () => {
    it('should throw error for trait that does not exist', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      expect(async () => {
        await service.deleteTrait(uuidv4());
      }).rejects.toThrow();
    });
    it('should delete the trait successfully by given Id', async () => {
      const trait = {
        id: uuidv4(),
        title: faker.word.noun(),
        deleteAt: new Date(),
      };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(trait);
      const result = await service.deleteTrait(trait.id);
      expect(result.deletedAt).not.toBe(null);
    });
  });

  describe('Trait Toggle Status', () => {
    it('should throw error for trait that does not exist', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      expect(async () => {
        await service.toggleTraitStatus(uuidv4());
      }).rejects.toThrow();
    });

    it('should change the status of trait', async () => {
      const traitObj = {
        isActive: true,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(traitObj);
      jest.spyOn(repository, 'save').mockResolvedValue(!traitObj.isActive);

      const result = await service.toggleTraitStatus(uuidv4());
      expect(result).toEqual(traitObj.isActive);
    });
  });

  describe('Trait List By Pillars', () => {
    it('should return trait list by pillars', async () => {
      //ARRANGE
      const pillars = [
        { id: '635bd72d2772716e3306a835', title: 'Financial' },
        { id: '635bd72d2772716e3306a836', title: 'Professional' },
      ];
      const pillarTitles = pillars.map((pillar) => pillar.title);
      const pillarIds = pillars.map((pillar) => pillar.id);
      const units = [{ unit: 'ml', id: '6554a0fdb4e67a7b04d095f5' }];
      const userId = uuidv4();
      const traitId = uuidv4();
      const userTraits = [{ userId, traitId }];
      const traitCount = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
      const traits = [];
      for (let i = 0; i < traitCount; i++) {
        traits.push({
          id: uuidv4(),
          title: faker.word.verb(),
          goal: faker.number.int(),
          unitId: units[0].id,
          repetition: TraitIntervals.Daily,
          description: faker.word.words(),
          language: 'en',
          target: faker.number.int({ min: 1, max: 100 }),
          isActive: true,
          pillarId: i % 2 === 0 ? pillars[0].id : pillars[1].id,
        });
      }

      jest.spyOn(pillarEvents, 'getAllPillars').mockResolvedValue(pillars);
      jest.spyOn(progressEvents, 'getMeasurementList').mockResolvedValue(units);
      jest.spyOn(userTraitsRepo, 'find').mockResolvedValue(userTraits);
      jest.spyOn(repository, 'find').mockResolvedValue(traits);

      //ACT
      const traitList = await service.getTraitListByPillars(uuidv4(), 'en');

      //ASSERT
      traitList.forEach((trait) => {
        expect(trait).toHaveProperty('pillarTitle');
        expect(trait).toHaveProperty('pillarId');
        expect(trait).toHaveProperty('traits');
        expect(pillarTitles).toContain(trait.pillarTitle);
        expect(pillarIds).toContain(trait.pillarId);
      });
    });
  });
});
