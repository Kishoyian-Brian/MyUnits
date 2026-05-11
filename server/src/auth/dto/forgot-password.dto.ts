import { IsNotEmpty, IsString } from 'class-validator';

export class forgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
