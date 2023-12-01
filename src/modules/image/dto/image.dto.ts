import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class newImageDto {
  @IsNotEmpty({ message: 'Text cannot be empty' })
  @IsString({ message: 'Invalid text format' })
  @MinLength(10, { message: 'Text must be at least 10 characters long' })
  @MaxLength(8192, { message: 'Text cannot be longer than 8192 characters' })
  text: string;
}

export class generateImageDto {
  @IsNotEmpty({ message: 'Text cannot be empty' })
  @IsString({ message: 'Invalid text format' })
  @MinLength(3, { message: 'Text must be at least 3 characters long' })
  @MaxLength(1000, { message: 'Text cannot be longer than 1000 characters' })
  text: string;
}
