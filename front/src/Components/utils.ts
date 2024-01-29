import axios from "axios";

type genre = "romance" | "mystery" | "fiction" | "fantasy" | "adventure" | "action" | "science fiction" | "biography";
let genres = ["romance", "mystery", "fiction", "fantasy", "adventure", "action", "science fiction", "biography"] as const;

interface NewAuthor {
    name: string,
    bio: string
}

interface NewBook {
    author_id: number,
    title: string,
    pub_year: number,
    genre: genre
}

interface Author {
    id: number,
    name: string,
    bio: string
}

interface Book {
    id: number,
    author_id: number,
    title: string,
    pub_year: number,
    genre: genre
}

function ensureError(value: unknown): Error {
    if (value instanceof Error) return value;

    let stringified;
    try {
        stringified = JSON.stringify(value);
    } catch {
        stringified = "[Unable to stringify the thrown value]";
    }

    let error = new Error(
        `Thrown value was originally not an error; stringified value is: ${stringified}`
    );
    return error;
}

function getAxiosErrorMessages(err: unknown): string[] {
    let error = ensureError(err);
    console.log(error);

    if (!axios.isAxiosError(error)) {
        return [error.toString()];
    }

    if (!error.response) {
        return ["Server never sent response"];
    }

    if (!error.response.data?.errors) {
        return [error.message];
    }

    return error.response.data.errors;
}

export { getAxiosErrorMessages, genres };
export type { genre, NewAuthor, NewBook, Book, Author };