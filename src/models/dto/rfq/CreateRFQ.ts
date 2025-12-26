import { RFQPart } from "@/models/RFQPart";
import { Type } from "class-transformer";
import {
  Length,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from "class-validator";

export class CreateRFQReq {
  @Length(3)
  @IsOptional()
  uid: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => RFQPart)
  parts: RFQPart[];
}

export type CreateRFQRes = {
  message: string;
  rfqs: RFQPart[];
};