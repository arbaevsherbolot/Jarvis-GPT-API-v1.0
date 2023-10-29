import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Languages } from './chat.enum';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  title: string;

  @IsEnum(Languages)
  language: Languages;
}

export class EditChatDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  title: string;

  @IsEnum(Languages)
  language: Languages;
}