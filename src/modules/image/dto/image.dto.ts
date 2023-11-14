import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class newImageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(8192)
  @MinLength(10)
  text: string;
}
