import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  title: string;
}
