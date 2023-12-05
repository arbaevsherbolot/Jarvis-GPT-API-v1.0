import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email or username cannot be empty' })
  @IsString({ message: 'Invalid email or username format' })
  emailOrUsername: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot be longer than 16 characters' })
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'First Name cannot be empty' })
  @IsString({ message: 'First Name must be a string' })
  @MinLength(2, { message: 'First Name must be at least 2 characters long' })
  @MaxLength(64, { message: 'First Name cannot be longer than 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last Name cannot be empty' })
  @IsString({ message: 'Last Name must be a string' })
  @MinLength(2, { message: 'Last Name must be at least 2 characters long' })
  @MaxLength(64, { message: 'Last Name cannot be longer than 50 characters' })
  lastName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot be longer than 16 characters' })
  password: string;
}

export class EditMeDto {
  @IsOptional()
  @IsNotEmpty({ message: 'First Name cannot be empty' })
  @IsString({ message: 'First Name must be a string' })
  @MinLength(2, { message: 'First Name must be at least 2 characters long' })
  @MaxLength(64, { message: 'First Name cannot be longer than 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Last Name cannot be empty' })
  @IsString({ message: 'Last Name must be a string' })
  @MinLength(2, { message: 'Last Name must be at least 2 characters long' })
  @MaxLength(64, { message: 'Last Name cannot be longer than 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(80, { message: 'Username cannot be longer than 80 characters' })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Nationality cannot be empty' })
  @IsString({ message: 'Nationality must be a string' })
  nationality?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Bio cannot be empty' })
  @IsString({ message: 'Bio must be a string' })
  @MinLength(5, { message: 'Bio must be at least 5 characters long' })
  @MaxLength(370, { message: 'Bio cannot be longer than 370 characters' })
  bio?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Phone cannot be empty' })
  @IsString({ message: 'Phone must be a string' })
  phone?: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token cannot be empty' })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot be longer than 16 characters' })
  password: string;
}
