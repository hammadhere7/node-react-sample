import { Between, In, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { userTrait } from 'src/entities/user-trait.entity';
import { Trait } from 'src/entities/trait.entity';
import { PillarEvents } from 'shared/events/pillar.events';
import { ProgressEvents } from 'shared/events/progress.events';
import { SharedPillar } from 'shared/models/shared-pillar.model';
import { translateData } from 'common/utils/helpers';
import { userTraitOutput } from 'src/dtos/user-trait.dto';
import { TraitCompletion } from 'src/entities/trait-completion.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompletionFilter, TraitCompletionOutput } from 'src/dtos/completion-filter.dto';
import { some } from 'lodash';
import * as moment from 'moment-timezone';
import { PointsStatus } from 'src/entities/points-status.entity';
import { getEndOfDay, getStartOfDay, getWeeklyDurationDates } from 'src/helpers';
import { LoyaltyEvents } from 'shared/events/loyalty.events';
import { COMPLETION_POINTS } from 'src/constants';
import { PostgresDbService } from 'common/services/postgres-db.service';
import { TraitService } from './trait.service';
import { TraitCompletionService } from './completion.service';
import { PointsStatusService } from './points.service';

@Injectable()
export class userTraitService extends PostgresDbService<userTrait> {
  constructor(
    private pillarEvents: PillarEvents,
    private progressEvents: ProgressEvents,
    private loyaltyEvents: LoyaltyEvents,

    @Inject(forwardRef(() => TraitService))
    private readonly traitService: TraitService,

    private completionService: TraitCompletionService,
    private pointsService: PointsStatusService,
  ) {
    super(userTrait.name);
  }

  async startTrait(traitId: string, userId: string) {
    const trait = await this.traitService.repository.findOne({
      where: {
        id: traitId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    if (!trait) throw new NotFoundException(`No trait found with the Id ${traitId}`);

    const userTrait = await this.repository.findOne({
      where: {
        userId,
        traitId,
      },
    });

    if (userTrait) {
      if (userTrait.status) throw new BadRequestException(`You have already started this trait with Id: ${traitId}`);
      else {
        userTrait.dateStarted = new Date();
        userTrait.status = true;
        await this.repository.update(userTrait.id, userTrait);
        return true;
      }
    }

    try {
      await this.repository.save({ userId, traitId });
      return true;
    } catch (e) {
      Logger.log(`Error in starting the user trait ${traitId}: ${userId}`);
      return false;
    }
  }

  async getAlluserTraits(userId: string, language: string, date: Date, timezone: string) {
    const dateStarted = new Date(date);

    dateStarted.setHours(23);
    dateStarted.setMinutes(59);
    const userTraits = await this.repository.find({
      where: {
        userId,
        dateStarted: LessThanOrEqual(dateStarted),
        status: true,
        trait: {
          deletedAt: IsNull(),
          isActive: true,
        },
      },
      relations: {
        completions: true,
      },
      order: {
        trait: {
          title: 'ASC',
        },
      },
    });
    if (!userTraits) return [];
    const response = [];
    const pillars: SharedPillar[] = await this.pillarEvents.getAllPillars();
    const units = await this.progressEvents.getMeasurementList();

    for (let pillar of pillars) {
      pillar = translateData(pillar, language);
      const pillarObj = {
        pillarId: pillar.id,
        pillarTitle: pillar.title,
        userTraits: [],
      };

      userTraits.map(async (userTrait: userTraitOutput) => {
        if (userTrait.trait.pillarId === pillar.id) {
          userTrait.traitDetail = translateData(userTrait.trait, language);
          userTrait.traitDetail.pillar = pillar;
          units.map((unit) => {
            if (userTrait.traitDetail.unitId === unit.id) userTrait.traitDetail.unit = translateData(unit, language);
          });
          userTrait.completed = this.getCompletionForDay(userTrait.completions, date, timezone);
          pillarObj.userTraits.push(userTrait);
        }
      });
      if (pillarObj.userTraits.length) response.push(pillarObj);
    }
    return response;
  }

  async getSingleuserTrait(traitId: string, userId: string, language: string, timeZone: string) {
    const trait = await this.traitService.repository.findOne({
      where: {
        id: traitId,
        deletedAt: IsNull(),
      },
    });

    if (!trait) throw new BadRequestException(`No trait exists with the Id: ${traitId} `);

    if (!trait.isActive)
      throw new BadRequestException(`The trait with Id: ${traitId} has been deactivated by the administrator`);

    const userTrait: userTraitOutput = await this.repository.findOne({
      where: {
        userId,
        traitId,
        status: true,
        trait: {
          deletedAt: IsNull(),
          isActive: true,
        },
      },
      relations: {
        completions: true,
      },
    });

    if (!userTrait) throw new BadRequestException(`You have not started the trait with Id ${traitId}`);

    const pillars: SharedPillar[] = await this.pillarEvents.getAllPillars();
    const units = await this.progressEvents.getMeasurementList();

    userTrait.traitDetail = trait;

    for (let pillar of pillars) {
      pillar = translateData(pillar, language);
      if (pillar.id === userTrait.traitDetail.pillarId) userTrait.traitDetail.pillar = pillar;
    }

    for (const unit of units) {
      if (unit.id === userTrait.traitDetail.unitId) userTrait.traitDetail.unit = translateData(unit, language);
    }

    const today = new Date();
    userTrait.completed = this.getCompletionForDay(userTrait.completions, today, timeZone);
    const { startDate, endDate } = getWeeklyDurationDates(timeZone);

    userTrait.completionHistory = await this.getTraitCompletions(
      {
        traitId: userTrait.traitId,
        startDate,
        endDate,
      },
      userId,
      timeZone,
    );

    return userTrait;
  }

  async isTraitEntrolled(traitId: string, userId: string): Promise<boolean> {
    const userTrait: userTraitOutput = await this.repository.findOne({
      where: {
        userId,
        traitId,
      },
    });

    if (userTrait) {
      return userTrait.status;
    }

    return false;
  }

  async toggleTraitCompletion(traitId: string, userId: string, timeZone: string) {
    const userTrait = await this.repository.findOne({ where: { traitId, userId } });

    if (!userTrait) throw new BadRequestException(`No user trait exist with the ID ${traitId}`);

    const startOfDay = getStartOfDay(timeZone);
    const endOfDay = getEndOfDay(timeZone);

    const start = startOfDay.toISOString();
    const end = endOfDay.toISOString();

    const completion = await this.completionService.repository
      .createQueryBuilder()
      .where('"userTraitId" = :userTraitId', { userTraitId: userTrait.id })
      .andWhere('"dateCompleted" BETWEEN :start AND :end', { start, end })
      .getOne();

    if (completion) {
      await this.completionService.repository.delete(completion.id);
      if (userTrait.streak > 0) {
        userTrait.streak--;
        await this.repository.update(userTrait.id, userTrait);
      }
      return false;
    } else {
      const model = { userTraitId: userTrait.id };
      await this.completionService.repository.save(model);
      await this.awardPointsOnCompletion(userId, timeZone);
      userTrait.streak++;
      await this.repository.update(userTrait.id, userTrait);
      return true;
    }
  }

  getCompletionForDay(completions: TraitCompletion[], date: Date, timeZone: string) {
    let completed = false;

    for (const completion of completions) {
      const completionDate = moment.tz(completion.dateCompleted, timeZone).format('YYYY-MM-DD');
      const matchDate = moment.tz(date, timeZone).format('YYYY-MM-DD');
      if (completionDate === matchDate) completed = true;
    }

    return completed;
  }

  @Cron(CronExpression.EVERY_HOUR, {
    timeZone: 'GMT',
  })
  @Cron(CronExpression.EVERY_HOUR, {
    timeZone: 'GMT',
  })
  async terminateTraitStreak() {
    const currentDate = new Date();

    const olderThanTwoDays = new Date(new Date().setDate(new Date().getDate() - 2));
    olderThanTwoDays.setHours(currentDate.getHours());
    olderThanTwoDays.setMinutes(currentDate.getMinutes());

    const userTraits = await this.completionService.repository
      .createQueryBuilder('traitCompletion')
      .select(['"userTraitId"', '"dateCompleted"', 'userTrait.streak'])
      .innerJoin('traitCompletion.userTrait', 'userTrait')
      .where('userTrait.streak > 0')
      .distinctOn(['"userTraitId"'])
      .orderBy('"userTraitId"', 'DESC')
      .addOrderBy('"dateCompleted"', 'DESC')
      .getRawMany();

    const userTraitIds = [];

    userTraits.forEach((userTrait) => {
      if (userTrait.dateCompleted < olderThanTwoDays) return userTraitIds.push(userTrait.userTraitId);
    });

    if (userTraitIds.length > 0) {
      await this.repository.update({ id: In(userTraitIds) }, { streak: 0 });
      Logger.log(`Terminated trait streaks for ${userTraitIds.length} traits`);
    }
    return true;
  }

  async getTraitCompletions(completionFilter: CompletionFilter, userId: string, timeZone: string) {
    const userTrait = await this.repository.findOne({
      where: {
        traitId: completionFilter.traitId,
        userId,
        trait: {
          isActive: true,
          deletedAt: IsNull(),
        },
      },
    });

    if (!userTrait) throw new BadRequestException(`The trait with the Id ${completionFilter.traitId} does not exist`);

    const completions = await this.completionService.repository.find({
      where: {
        userTraitId: userTrait.id,
        dateCompleted: Between(completionFilter.startDate, completionFilter.endDate),
      },
    });

    const completionHistory: TraitCompletionOutput[] = [];
    for (
      let currentDate = completionFilter.startDate;
      currentDate <= completionFilter.endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      completionHistory.push({
        date: moment.tz(currentDate, timeZone).format('YYYY-MM-DD'),
        completed: some(completions, (completion) => {
          const completionDate = moment.tz(completion.dateCompleted, timeZone).format('YYYY-MM-DD');
          const cDate = moment.tz(currentDate, timeZone).format('YYYY-MM-DD');
          return completionDate === cDate;
        }),
      });
    }

    return completionHistory;
  }

  async removeTraitEnrolment(traitId: string, userId: string) {
    const userTrait = await this.repository.findOne({
      where: {
        traitId,
        userId,
      },
    });

    if (!userTrait) throw new BadRequestException(`You have not started the trait with Id ${traitId}`);

    userTrait.status = false;

    await this.repository.update(userTrait.id, userTrait);
    return true;
  }

  async awardPointsOnCompletion(userId: string, timeZone: string) {
    const startDate = getStartOfDay(timeZone);
    const endDate = getEndOfDay(timeZone);

    const pointsStatus = await this.pointsService.repository
      .createQueryBuilder('points_status')
      .where('points_status."userId" = :userId', { userId })
      .andWhere('points_status."dateAwarded" BETWEEN :startDate and :endDate', {
        startDate,
        endDate,
      })
      .getOne();

    if (!pointsStatus) {
      await this.pointsService.repository.save({ userId });
      this.loyaltyEvents.addPoints({
        points: COMPLETION_POINTS,
        userId: userId,
        comment: 'Trait',
        messageType: 'TraitCompleted',
      });
      Logger.log(`Action: Award points to user ${userId} for the day ${startDate}`);
    } else {
      Logger.log(`Action: Award points Skipped. User already got points for trait completion for today`);
    }
  }
}
