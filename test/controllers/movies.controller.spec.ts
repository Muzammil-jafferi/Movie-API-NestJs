import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from '../../src/controllers/movies.controller';
import { MoviesService } from '../../src/services/movies.service';
import { CreateMovieDto } from '../../src/dto/create-movie.dto';
import { UpdateMovieDto } from '../../src/dto/update-movie.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Movie } from '../../src/entities/movie.entity';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a movie', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'Test Movie',
      description: 'Description',
      releaseDate: new Date(),
      genres: ['Genre1'],
    };
    const createdMovie = { id: 1, ...createMovieDto };

    jest.spyOn(service, 'create').mockResolvedValue(createdMovie);

    const result = await controller.create(createMovieDto);

    expect(result).toEqual(createdMovie);
  });

  it('should handle error when movie creation fails', async () => {
    const createMovieDto: CreateMovieDto = {
      title: 'Test Movie',
      description: 'Description',
      releaseDate: new Date(),
      genres: ['Genre1'],
    };
    const error = new Error('Creation failed');

    jest.spyOn(service, 'create').mockRejectedValue(error);

    await expect(controller.create(createMovieDto)).rejects.toThrowError(error);
  });

  it('should return all movies', async () => {
    const movies = [
      {
        id: 1,
        title: 'Test Movie 1',
        description: 'Description 1',
        releaseDate: new Date(),
        genres: ['Genre1'],
      },
      {
        id: 2,
        title: 'Test Movie 2',
        description: 'Description 2',
        releaseDate: new Date(),
        genres: ['Genre2'],
      },
    ];

    jest
      .spyOn(service, 'findAll')
      .mockResolvedValue({ data: movies, count: movies.length });

    const result = await controller.findAll(1, 10);

    expect(result).toEqual({ data: movies, count: movies.length });
  });

  it('should handle error when fetching movies fails', async () => {
    const error = new Error('Fetch failed');

    jest.spyOn(service, 'findAll').mockRejectedValue(error);

    await expect(controller.findAll(1, 10)).rejects.toThrowError(error);
  });

  it('should find a movie by id', async () => {
    const movieId = '1';
    const movie = {
      id: 1,
      title: 'Test Movie',
      description: 'Description',
      releaseDate: new Date(),
      genres: ['Genre1'],
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(movie);

    const result = await controller.findOne(movieId);

    expect(result).toEqual(movie);
  });

  it('should handle error when movie not found by id', async () => {
    const movieId = '999';
    const error = new NotFoundException('Movie not found');

    jest.spyOn(service, 'findOne').mockRejectedValue(error);

    await expect(controller.findOne(movieId)).rejects.toThrowError(error);
  });

  it('should update a movie', async () => {
    const movieId = '1';
    const updateMovieDto: UpdateMovieDto = {
      title: 'Updated Movie',
      description: 'Updated Description',
    };
    const updatedMovie: Movie = {
      id: 1,
      title: updateMovieDto.title,
      description: updateMovieDto.description,
      releaseDate: new Date(),
      genres: [],
    };

    jest.spyOn(service, 'update').mockResolvedValue(updatedMovie);

    const result = await controller.update(movieId, updateMovieDto);

    expect(result).toEqual(updatedMovie);
  });

  it('should handle error when updating movie fails', async () => {
    const movieId = '1';
    const updateMovieDto: UpdateMovieDto = {
      title: 'Updated Movie',
      description: 'Updated Description',
    };
    const error = new NotFoundException('Movie not found');

    jest.spyOn(service, 'update').mockRejectedValue(error);

    await expect(
      controller.update(movieId, updateMovieDto),
    ).rejects.toThrowError(error);
  });

  it('should remove a movie', async () => {
    const movieId = '1';
    const movie = {
      id: 1,
      title: 'Test Movie',
      description: 'Description',
      releaseDate: new Date(),
      genres: ['Genre1'],
    };

    jest.spyOn(service, 'remove').mockResolvedValue(movie);

    const result = await controller.remove(movieId);

    expect(result).toEqual(movie);
  });

  it('should handle error when removing movie fails', async () => {
    const movieId = '1';
    const error = new NotFoundException('Movie not found');

    jest.spyOn(service, 'remove').mockRejectedValue(error);

    await expect(controller.remove(movieId)).rejects.toThrowError(error);
  });

  it('should search for movies by title', async () => {
    const title = 'Test Movie';

    const movies = [
      {
        id: 1,
        title: 'Test Movie 1',
        description: 'Description 1',
        releaseDate: new Date(),
        genres: ['Genre1'],
      },
      {
        id: 2,
        title: 'Test Movie 2',
        description: 'Description 2',
        releaseDate: new Date(),
        genres: ['Genre2'],
      },
    ];

    jest.spyOn(service, 'search').mockResolvedValue(movies);

    const result = await controller.search(title);

    expect(result).toEqual(movies);
  });

  it('should handle error when searching for movies with invalid parameters', async () => {
    try {
      await controller.search();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        'At least one search parameter (title or genre) must be provided',
      );
    }
  });
});
