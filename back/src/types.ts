import z from 'zod';
import { Response, Request } from 'express';

interface MessageResponse {
    message: string;
}

type EmptyResponse = "";

let loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

type Genre = "romance" | "mystery" | "fiction" | "fantasy" | "adventure" | "action" | "science fiction" | "biography";

interface Book {
    id: number,
    author_id: number,
    title: string,
    pub_year: number,
    genre: Genre
}

interface NewBook {
    author_id: number,
    title: string,
    pub_year: number,
    genre: Genre
}

interface Author {
    id: number,
    name: string,
    bio: string
}

interface NewAuthor {
    name: string,
    bio: string
}

interface Error {
    error: string | string[];
}

type BookResponse = Response<Book | Error>;
type AuthorResponse = Response<Author | Error>;
type BooksResponse = Response<Book[] | Error>;
type AuthorsResponse = Response<Author[] | Error>;

interface BooksGetRequest extends Request {
    query: {
        id: string,
        author_id: string,
        title: string,
        pub_year: string,
        genre: Genre
    },
    params: {
        id: string
    }
}

interface AuthorsGetRequest extends Request {
    query: {
        id: string,
        name: string,
        bio: string
    },
    params: {
        id: string
    }
}

interface AuthorRequest extends Request {
    body: NewAuthor
}

interface BookRequest extends Request {
    body: NewBook
}

interface DeleteRequest extends Request {
    params: {
        id: string
    }
}

let genres = ["romance", "mystery", "fiction", "fantasy", "adventure", "action", "science fiction", "biography"] as const;

let newAuthorBodySchema = z.object({
    name: z.string(),
    bio: z.string()
})

let newBookBodySchema = z.object({
    author_id: z.number(),
    title: z.string(),
    pub_year: z.number(),
    genre: z.enum(genres)
})

let bookBodySchema = z.object({
    id: z.number(),
    author_id: z.number(),
    title: z.string(),
    pub_year: z.number(),
    genre: z.enum(genres)
})

let authorBodySchema = z.object({
    id: z.number(),
    name: z.string(),
    bio: z.string()
})

export type { EmptyResponse, MessageResponse, Error, Genre, Book, Author, NewBook, NewAuthor, BookResponse, BooksResponse, AuthorResponse, AuthorsResponse, AuthorsGetRequest, AuthorRequest, BooksGetRequest, BookRequest, DeleteRequest };
export { newAuthorBodySchema, newBookBodySchema, bookBodySchema, authorBodySchema, genres, loginSchema };
