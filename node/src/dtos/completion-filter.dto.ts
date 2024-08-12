import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class CompletionFilter {
  @IsNotEmpty()
  @Field()
  traitId: string;

  @IsNotEmpty()
  @Field()
  startDate: Date;

  @IsNotEmpty()
  @Field()
  endDate: Date;
}

@ObjectType()
export class TraitCompletionOutput {
  @Field()
  date: string;

  @Field()
  completed: boolean;
}
