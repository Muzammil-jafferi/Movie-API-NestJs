import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOperator, In } from 'typeorm';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Movie } from '../entities/movie.entity';
import { Genre } from '../entities/genre.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const genres = await this.genresRepository.find({ where: { name: In(createMovieDto.genres) } });

    if (genres.length !== createMovieDto.genres.length) {
      const foundGenreNames = genres.map((genre) => genre.name);
      const missingGenres = createMovieDto.genres.filter((genre) => !foundGenreNames.includes(genre));
      throw new BadRequestException(`Genres not found: ${missingGenres.join(', ')}`);
    }
    
    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async findAll(page: number, limit: number) {
    const [result, total] = await this.moviesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: result, count: total };
  }

  findOne(id: number) {
    return this.moviesRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.moviesRepository.preload({
      id,
      ...updateMovieDto,
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return this.moviesRepository.save(movie);
  }

  async remove(id: number) {
    const movie = await this.findOne(id);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return this.moviesRepository.remove(movie);
  }

  search(title?: string, genre?: string) {
    if (!title && !genre) {
        throw new BadRequestException('At least one search parameter (title or genre) must be provided');
      }
  
      let query = this.moviesRepository.createQueryBuilder('movie');
  
      if (title) {
        query = query.where('movie.title ILIKE :title', { title: `%${title}%` });
      }
  
      if (genre) {
        query = query.andWhere(`'${genre}' = ANY(movie.genres)`);
      }
  
      return query.getMany();
  }
}
