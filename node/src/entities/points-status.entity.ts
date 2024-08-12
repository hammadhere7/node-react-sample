import { Field, ObjectType } from '@nestjs/graphql';
import { BasicBaseEntity } from '../../common/base/base.entity';
import { Column, Entity } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
@Entity()
export class PointsStatus extends BasicBaseEntity {
  @IsNotEmpty()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  dateAwarded: Date;

  @Field()
  @Column({ name: 'userId' })
  userId: string;
}
