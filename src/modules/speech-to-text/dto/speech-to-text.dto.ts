import { IsNotEmpty, IsString } from 'class-validator';

export class StartRecognitionDto {
  @IsNotEmpty()
  @IsString()
  audio: string;
}
