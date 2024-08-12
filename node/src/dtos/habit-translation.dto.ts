import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';

@InputType()
export class TraitTranslationInput {
  @Field(() => GraphQLJSONObject, {
    description: `Structure: { ar: {}, fr: {}, ...}`,
    nullable: true,
  })
  translations?: any;
}
