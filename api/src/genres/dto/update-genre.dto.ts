import { IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
