import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trait } from 'src/entities/trait.entity';
import { userTraitService } from './user-trait.service';
import { userTrait } from 'src/entities/user-trait.entity';
import { v4 as uuidv4 } from 'uuid';
import { PillarEvents } from 'shared/events/pillar.events';
import { ProgressEvents } from 'shared/events/progress.events';
import { TraitCompletion } from 'src/entities/trait-completion.entity';
import { faker } from '@faker-js/faker';
import { PointsStatus } from 'src/entities/points-status.entity';
import { LoyaltyEvents } from 'shared/events/loyalty.events';
import { TraitService } from './trait.service';
import { PointsStatusService } from './points.service';
import { TraitCompletionService } from './completion.service';

describe('userTrait Service', () => {
  let service: userTraitService;
  let traitService: TraitService;
  let pointsService: PointsStatusService;
  let completionService: TraitCompletionService;
  const traitRepo = {
    findOne: jest.fn(),
  };

  const pillarEvents = {
    getAllPillars: jest.fn(),
  };
  const loyaltyEvents = {
    addPoints: jest.fn(),
  };
  const progressEvents = {
    getMeasurementList: jest.fn(),
  };

  const userTraitRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const pointsRepo = {
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValueOnce(null),
    })),
  };

  const completionRepo = {
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValueOnce(null),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        userTraitService,
        {
          provide: getRepositoryToken(userTrait),
          useValue: userTraitRepo,
        },
        {
          provide: getRepositoryToken(Trait),
          useValue: traitRepo,
        },
        {
          provide: getRepositoryToken(TraitCompletion),
          useValue: completionRepo,
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
          provide: LoyaltyEvents,
          useValue: loyaltyEvents as unknown as jest.Mocked<PillarEvents>,
        },
        {
          provide: getRepositoryToken(PointsStatus),
          useValue: pointsRepo,
        },
        {
          provide: TraitService,
          useValue: traitService as unknown as jest.Mocked<TraitService>,
        },
        {
          provide: PointsStatusService,
          useValue: pointsService as unknown as jest.Mocked<PointsStatusService>,
        },
        {
          provide: TraitCompletionService,
          useValue: completionService as unknown as jest.Mocked<TraitCompletionService>,
        },
      ],
    }).compile();

    service = module.get<userTraitService>(userTraitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Start Trait', () => {
    let userId;
    let traitId;
    beforeEach(() => {
      userId = uuidv4();
      traitId = uuidv4();
    });

    it('Should throw exception for invalid trait Id', () => {
      //Act
      jest.spyOn(traitRepo, 'findOne').mockResolvedValue(null);

      //Assert
      expect(async () => {
        await service.startTrait(userId, traitId);
      }).rejects.toThrow();
    });
    it('Should throw exception for already started trait', () => {});
    it('Should start the trait successfully', () => {});
  });

  describe('User Trait List', () => {});

  describe('User Trait Detail', () => {});

  describe('Toggle trait completion status', () => {
    it('Should throw exception if user trait is not found', () => {
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(null);
      expect(async () => {
        await service.toggleTraitCompletion(uuidv4(), uuidv4(), 'UTC');
      }).rejects.toThrow();
    });

    it('Should mark the trait as completed for the given day', async () => {
      const userId = uuidv4();
      const traitId = uuidv4();
      const userTrait = { userId, traitId, id: uuidv4(), dateStarted: new Date().toISOString() };
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(userTrait);
      jest.spyOn(userTraitRepo, 'update').mockResolvedValue({});
      jest.spyOn(completionRepo.createQueryBuilder(), 'getOne').mockResolvedValue(null);

      const response = await service.toggleTraitCompletion(traitId, userId, 'UTC');
      expect(response).toBeTruthy();
    });
  });

  describe('Get Trait Completion History', () => {
    it('Should throw exception if trait is not found', () => {
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(null);
      expect(async () => {
        await service.getTraitCompletions(
          { traitId: uuidv4(), startDate: new Date(), endDate: new Date() },
          uuidv4(),
          'UTC',
        );
      }).rejects.toThrow();
    });

    it('Should return list of completion trait completion for date range', async () => {
      //ARRANGE
      const userId = uuidv4();
      const traitId = uuidv4();
      const userTrait = { userId, traitId, id: uuidv4() };
      const completions = [{ dateCompleted: new Date() }];
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(userTrait);
      jest.spyOn(completionRepo, 'find').mockResolvedValue(completions);
      const startDate = new Date();
      const dayDifference = faker.number.int({ min: 1, max: 10 });
      const day = 60 * 60 * 24 * 1000 * dayDifference;
      const endDate = new Date(startDate.getTime() + day);
      const completionFilter = {
        traitId,
        startDate,
        endDate,
      };

      //ACT
      const completionHisitory = await service.getTraitCompletions(completionFilter, uuidv4(), 'UTC');

      //ASSERT
      expect(completionHisitory).toBeInstanceOf(Array);
      expect(completionHisitory).toHaveLength(dayDifference + 1);
    });
  });

  describe('Remove trait enrolment', () => {
    it('Should throw exception if trait is not started by user', () => {
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(null);
      expect(async () => {
        await service.removeTraitEnrolment(uuidv4(), uuidv4());
      }).rejects.toThrow();
    });

    it('Should remove the trait enrolment successfully', async () => {
      //ARRANGE
      const userTrait = { status: true, id: uuidv4() };
      jest.spyOn(userTraitRepo, 'findOne').mockResolvedValue(userTrait);
      jest.spyOn(userTraitRepo, 'update').mockResolvedValue(userTrait);

      //ACT
      const response = await service.removeTraitEnrolment(uuidv4(), uuidv4());

      //ASSERT
      expect(response).toBeTruthy();
    });
  });
});
