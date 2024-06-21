# Movie API

## Description

This is a RESTful API built with NestJS and TypeORM for managing movies and genres.

## Getting Started

### Prerequisites

- Node.js (version >= 12)
- PostgreSQL database

### Installation

1. Clone the repository:

   git clone https://github.com/your-username/movie-api.git
   cd movie-api

2. Install dependencies: npm install

3. npm run start:dev

## API Endpoints

### Movies

- **POST /movies**: Create a new movie.
- **GET /movies**: List all movies (supports pagination).
- **GET /movies/:id**: Get a movie by ID.
- **PATCH /movies/:id**: Update a movie by ID.
- **DELETE /movies/:id**: Delete a movie by ID.
- **GET /movies/search**: Search movies by title or genre.

### Genres

- **POST /genres**: Create a new genre.
- **GET /genres**: List all genres.
- **DELETE /genres/:id**: Delete a genre by ID.
