import { Field, ObjectType } from '@nestjs/graphql';
import { BasicBaseEntity } from '../../common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Trait } from './trait.entity';
import { TraitCompletion } from './trait-completion.entity';

@ObjectType()
@Entity()
export class UserTrait extends BasicBaseEntity {
  @IsNotEmpty()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  dateStarted: Date;

  @Field()
  @Column({ default: 0 })
  @IsNotEmpty()
  streak: number;

  @Field(() => Trait)
  @ManyToOne(() => Trait, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'traitId' })
  trait: Trait;

  @Field()
  @Column({ name: 'traitId', nullable: false })
  @IsNotEmpty()
  traitId: string;

  @Field()
  @Column({ name: 'userId' })
  userId: string;

  @OneToMany(() => TraitCompletion, (completion) => completion.userTrait, { eager: false })
  public completions?: TraitCompletion[];

  @Field()
  @Column({ default: true })
  status: boolean;
}
