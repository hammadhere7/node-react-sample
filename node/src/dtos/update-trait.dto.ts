import { InputType, PartialType } from '@nestjs/graphql';
import { TraitCreate } from './create-trait.dto';

@InputType()
export class TraitUpdate extends PartialType(TraitCreate) {}
