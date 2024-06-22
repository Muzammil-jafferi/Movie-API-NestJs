import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from '../../src/services/genres.service';
import { Genre } from '../../src/entities/genre.entity';
import { Movie } from '../../src/entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from '../../src/dto/create-genre.dto';

describe('GenresService', () => {
  let service: GenresService;
  let genresRepository: Repository<Genre>;
  let moviesRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getRepositoryToken(Genre),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    genresRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
    moviesRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const createGenreDto: CreateGenreDto = { name: 'Test Genre' };
      const genre = new Genre();
      genre.id = 1;
      genre.name = createGenreDto.name;

      jest.spyOn(genresRepository, 'save').mockResolvedValue(genre);
      jest.spyOn(genresRepository, 'create').mockReturnValue(genre);

      expect(await service.create(createGenreDto)).toEqual(genre);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [
        { id: 1, name: 'Genre1' },
        { id: 2, name: 'Genre2' },
      ] as Genre[];

      jest.spyOn(genresRepository, 'find').mockResolvedValue(genres);

      expect(await service.findAll()).toEqual(genres);
    });
  });

  describe('remove', () => {
    it('should remove a genre and update movies', async () => {
      const genre = { id: 1, name: 'Test Genre' } as Genre;
      const movie = { id: 1, title: 'Test Movie', genres: ['Test Genre'] } as Movie;

      jest.spyOn(genresRepository, 'findOne').mockResolvedValue(genre);
      jest.spyOn(moviesRepository, 'find').mockResolvedValue([movie]);
      jest.spyOn(moviesRepository, 'save').mockResolvedValue({ ...movie, genres: [] });
      jest.spyOn(genresRepository, 'remove').mockResolvedValue(genre);

      const result = await service.remove(1);

      expect(result).toEqual(genre);
      expect(movie.genres).not.toContain('Test Genre');
    });

    it('should throw an error if genre is not found', async () => {
      jest.spyOn(genresRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
