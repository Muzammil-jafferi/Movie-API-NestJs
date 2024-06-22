import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../../src/services/movies.service';
import { Movie } from '../../src/entities/movie.entity';
import { Genre } from '../../src/entities/genre.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { release } from 'os';

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepository: Repository<Movie>;
  let genresRepository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Genre),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    genresRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        description: 'Test Description',
        releaseDate: new Date(),
        genres: ['Action'],
      };
      const genre = new Genre();
      genre.id = 1;
      genre.name = 'Action';
      const movie = { id: 1, ...createMovieDto } as Movie;

      jest.spyOn(genresRepository, 'find').mockResolvedValue([genre]);
      jest.spyOn(moviesRepository, 'create').mockReturnValue(movie);
      jest.spyOn(moviesRepository, 'save').mockResolvedValue(movie);

      expect(await service.create(createMovieDto)).toEqual(movie);
    });

    it('should throw an error if genre not found', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        description: 'Test Description',
        releaseDate: new Date(),
        genres: ['Unknown Genre'],
      };

      jest.spyOn(genresRepository, 'find').mockResolvedValue([]);

      await expect(service.create(createMovieDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const movies = [
        {
          id: 1,
          title: 'Test Movie',
          description: 'Test Description',
          releaseDate: new Date(),
          genres: ['Action'],
        },
      ];
      const total = 1;

      jest
        .spyOn(moviesRepository, 'findAndCount')
        .mockResolvedValue([movies, total]);

      expect(await service.findAll(1, 10)).toEqual({
        data: movies,
        count: total,
      });
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      const movie = {
        id: 1,
        title: 'Test Movie',
        description: 'Test Description',
        genres: ['Action'],
      } as Movie;

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(movie);

      expect(await service.findOne(1)).toEqual(movie);
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const updateMovieDto = {
        title: 'Updated Movie',
        description: 'Updated Description',
      };
      const movie = {
        id: 1,
        title: 'Test Movie',
        description: 'Test Description',
        genres: ['Action'],
      } as Movie;
      const updatedMovie = { ...movie, ...updateMovieDto };

      jest.spyOn(moviesRepository, 'preload').mockResolvedValue(updatedMovie);
      jest.spyOn(moviesRepository, 'save').mockResolvedValue(updatedMovie);

      expect(await service.update(1, updateMovieDto)).toEqual(updatedMovie);
    });

    it('should throw an error if movie not found', async () => {
      jest.spyOn(moviesRepository, 'preload').mockResolvedValue(null);

      await expect(
        service.update(1, { title: 'Updated Movie' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a movie', async () => {
      const movie = {
        id: 1,
        title: 'Test Movie',
        description: 'Test Description',
        genres: ['Action'],
      } as Movie;

      jest.spyOn(service, 'findOne').mockResolvedValue(movie);
      jest.spyOn(moviesRepository, 'remove').mockResolvedValue(movie);

      expect(await service.remove(1)).toEqual(movie);
    });

    it('should throw an error if movie not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search movies by title', async () => {
      const movies = [
        {
          id: 1,
          title: 'Test Movie',
          description: 'Test Description',
          genres: ['Action'],
        } as Movie,
      ];
      const title = 'Test';

      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movies),
      };

      jest
        .spyOn(moviesRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      expect(await service.search(title)).toEqual(movies);
    });

    it('should search movies by genre', async () => {
      const movies = [
        {
          id: 1,
          title: 'Test Movie',
          description: 'Test Description',
          genres: ['Action'],
        } as Movie,
      ];
      const genre = 'Action';

      const mockQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movies),
      };

      jest
        .spyOn(moviesRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      expect(await service.search(undefined, genre)).toEqual(movies);
    });
  });
});
