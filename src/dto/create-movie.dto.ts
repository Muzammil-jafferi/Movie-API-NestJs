import { IsString, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsDate()
  @Type(() => Date)
  readonly releaseDate: Date;

  @IsArray()
  @IsString({ each: true })
  readonly genres: string[];
}
