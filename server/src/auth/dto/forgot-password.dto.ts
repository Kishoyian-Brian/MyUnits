import { IsNotEmpty, IsString } from 'class-validator';

export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
