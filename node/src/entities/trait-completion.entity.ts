import { Field, ObjectType } from '@nestjs/graphql';
import { BasicBaseEntity } from '../../common/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { UserTrait} from './user-trait.entity';

@ObjectType()
@Entity()
export class TraitCompletion extends BasicBaseEntity {
  @IsNotEmpty()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  dateCompleted: Date;

  @Field(() => UserTrait)
  @ManyToOne(() => UserTrait, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userTraitId' })
  userTrait: UserTrait;

  @Field()
  @Column({ name: 'userTraitId', nullable: false })
  @IsNotEmpty()
  userTraitId: string;
}
