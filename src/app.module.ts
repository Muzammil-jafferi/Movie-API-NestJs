import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GenresController } from './controllers/genres.controller';
import { MoviesController } from './controllers/movies.controller';
import { GenresService } from './services/genres.service';
import { MoviesService } from './services/movies.service';
import { Genre } from './entities/genre.entity';
import { Movie } from './entities/movie.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'movie_db',
      entities: [Genre, Movie],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Genre, Movie]),
  ],
  controllers: [GenresController, MoviesController],
  providers: [GenresService, MoviesService],
})
export class AppModule {}
