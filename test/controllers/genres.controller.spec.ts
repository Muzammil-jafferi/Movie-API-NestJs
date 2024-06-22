import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from '../../src/controllers/genres.controller';
import { GenresService } from '../../src/services/genres.service';
import { CreateGenreDto } from '../../src/dto/create-genre.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GenresController', () => {
  let controller: GenresController;
  let service: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a genre', async () => {
    const createGenreDto: CreateGenreDto = { name: 'Test Genre' };
    const createdGenre = { id: 1, ...createGenreDto };

    jest.spyOn(service, 'create').mockResolvedValue(createdGenre);

    const result = await controller.create(createGenreDto);

    expect(result).toEqual(createdGenre);
  });

  it('should handle error when genre creation fails', async () => {
    const createGenreDto: CreateGenreDto = { name: 'Test Genre' };
    const error = new Error('Creation failed');

    jest.spyOn(service, 'create').mockRejectedValue(error);

    await expect(controller.create(createGenreDto)).rejects.toThrowError(error);
  });

  it('should return all genres', async () => {
    const genres = [{ id: 1, name: 'Test Genre' }];

    jest.spyOn(service, 'findAll').mockResolvedValue(genres);

    const result = await controller.findAll();

    expect(result).toEqual(genres);
  });

  it('should handle error when fetching genres fails', async () => {
    const error = new Error('Fetch failed');

    jest.spyOn(service, 'findAll').mockRejectedValue(error);

    await expect(controller.findAll()).rejects.toThrowError(error);
  });

  it('should remove a genre', async () => {
    const genreId = '1';
    const genre = { id: 1, name: 'Test Genre' };

    jest.spyOn(service, 'remove').mockResolvedValue(genre);

    const result = await controller.remove(genreId);

    expect(result).toEqual(genre);
  });

  it('should handle error when genre removal fails', async () => {
    const genreId = '1';
    const error = new NotFoundException('Genre not found');

    jest.spyOn(service, 'remove').mockRejectedValue(error);

    await expect(controller.remove(genreId)).rejects.toThrowError(error);
  });
});
