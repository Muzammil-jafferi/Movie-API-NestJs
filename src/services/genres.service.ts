import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { Genre } from '../entities/genre.entity';
import { Movie } from '../entities/movie.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  create(createGenreDto: CreateGenreDto) {
    const genre = this.genresRepository.create(createGenreDto);
    return this.genresRepository.save(genre);
  }

  findAll() {
    return this.genresRepository.find();
  }

  async remove(id: number) {
    const genre = await this.genresRepository.findOne({ where: { id } });

    if (!genre) {
        throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    const movies = await this.moviesRepository.find();
    for (const movie of movies) {
      movie.genres = movie.genres.filter(g => g !== genre.name);
      await this.moviesRepository.save(movie);
    }

    return this.genresRepository.remove(genre);
  }
}
