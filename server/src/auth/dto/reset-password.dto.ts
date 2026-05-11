import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class resetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
    
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
