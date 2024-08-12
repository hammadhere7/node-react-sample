import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from '../../common/base/base.entity';
import { Column, Entity } from 'typeorm';
import { Language } from '../../shared/enums/language.enum';
import { GraphQLJSON, GraphQLLocale } from 'graphql-scalars';
import { IsNotEmpty, Min } from 'class-validator';
import { TraitIntervals } from '../../src/enums/trait-interval.enum';

@ObjectType()
@Entity()
export class Trait extends BaseEntity {
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => GraphQLLocale)
  @Column()
  @IsNotEmpty()
  language: Language;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column()
  @IsNotEmpty()
  @Min(1)
  target: number;

  @Field(() => TraitIntervals)
  @Column({
    type: 'enum',
    enum: TraitIntervals,
    default: HTraitIntervals.Daily,
  })
  repetition: TraitIntervals;

  @Field(() => GraphQLJSON)
  @Column({ type: 'simple-json', nullable: true })
  public translations?: any;

  @Field()
  @Column({ name: 'pillarId', nullable: false })
  @IsNotEmpty()
  pillarId: string;

  @Field()
  @Column({ name: 'unitId', nullable: false })
  @IsNotEmpty()
  unitId: string;
}
