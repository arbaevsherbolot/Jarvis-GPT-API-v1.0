import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Languages } from './chat.enum';

export class CreateChatDto {
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString({ message: 'Invalid title format' })
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  @MaxLength(25, { message: 'Title cannot be longer than 25 characters' })
  title: string;

  @IsEnum(Languages, { message: 'Invalid language value' })
  language: Languages;
}

export class EditChatDto extends CreateChatDto {}
