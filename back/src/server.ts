import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { Database, ISqlite, Statement, open } from "sqlite";
import * as url from "url";
import { z } from "zod";
import cors from "cors";

let app = express();
app.use(express.json());
app.use(cors());

let __dirname: string = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile: string = `${__dirname}database.db`;
let db: Database = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

export interface Error {
    error: string | string[];
}

type Genre = "romance" | "mystery" | "fiction" | "fantasy" | "adventure" | "action" | "science fiction" | "biography";

export interface Book {
    id: number,
    author_id: number,
    title: string,
    pub_year: number,
    genre: Genre
}

export interface NewBook {
    author_id: number,
    title: string,
    pub_year: number,
    genre: Genre
}

export interface Author {
    id: number,
    name: string,
    bio: string
}

export interface NewAuthor {
    name: string,
    bio: string
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

function parseError(zodError: z.ZodError): string[] {
    let { formErrors, fieldErrors } = zodError.flatten();
    return [
        ...formErrors,
        ...Object.entries(fieldErrors).map(
            ([property, message]) => `"${property}": ${message}`
        ),
    ];
}

function addQueryStringSupport(req: Request, res: Response, tablename: string): string {
    let queryParams: string[] = [];
    let queryString: string = `SELECT * FROM ${tablename} `;
    let queryObj: any = req.query;
    for (const parameter in req.query) {
        queryParams.push(parameter);
    }
    for (const i in queryParams) {
        if (queryString == `SELECT * FROM ${tablename} `) {
            queryString += `WHERE ${queryParams[i]}=${queryObj[queryParams[i]]} `;
        } else {
            queryString += `AND ${queryParams[i]}=${queryObj[queryParams[i]]} `;
        }
    }
    return queryString;
}

app.get("/api/books", async (req: BooksGetRequest, res: BooksResponse) => {
    let result: Book[];
    try {
        result = await db.all(addQueryStringSupport(req, res, "books"));
    } catch (err) {
        let error = err as Object;
        return res.status(400).json({ error: error.toString() });
    }
    return res.status(200).json(result);
})

app.get("/api/books/:id", async (req, res: BookResponse) => {
    let result: Book[] | undefined;
    try {
        result = await db.all<Book[]>(`SELECT * FROM books WHERE ID='${req.params.id}'`);
        if (result === undefined) {
            return res.status(404).json({ error: `No book was found with ID: ${req.params.id}` });
        }
    } catch (err) {
        let error = err as Object;
        return res.status(400).json({ error: error.toString() });
    }
    return res.status(200).json(result[0]);
})

app.get("/api/authors", async (req: AuthorsGetRequest, res: AuthorsResponse) => {
    let result: Author[];
    try {
        result = await db.all(addQueryStringSupport(req, res, "authors"));
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() })
    }
    return res.status(200).json(result);
})

app.get("/api/authors/:id", async (req, res: AuthorResponse) => {
    let result: Author[] | undefined;
    try {
        result = await db.all(`SELECT * FROM authors WHERE ID='${req.params.id}'`);
        if (result === undefined) {
            return res.status(404).json({ error: `No author was found with ID: ${req.params.id}` });
        }
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
    return res.status(200).json(result[0]);
})

app.post("/api/books", async (req: BookRequest, res: BookResponse) => {
    let newBook: NewBook;
    let insertedBook: Book;
    try {
        let parseResult = newBookBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw parseError(parseResult.error);
        }
        let authorCheck: Author[] = await db.all(`SELECT * FROM AUTHORS WHERE ID=${req.body.author_id}`);
        if (authorCheck.length == 0) {
            throw "The author associated with author_id specified does not exist";
        }
        newBook = req.body;
        let statement: Statement = await db.prepare("INSERT INTO BOOKS(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)");
        await statement.bind([null, newBook.author_id, newBook.title, newBook.pub_year, newBook.genre]);
        let result: ISqlite.RunResult = await statement.run();
        let newID: number|undefined = result.lastID;
        insertedBook = (await db.all(`SELECT * FROM BOOKS WHERE ID=${newID}`))[0];
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
    return res.status(201).json(insertedBook);
});

app.post("/api/authors", async (req: AuthorRequest, res: AuthorResponse) => {
    let newAuthor: NewAuthor;
    let insertedAuthor: Author;
    try {
        let parseResult = newAuthorBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw parseError(parseResult.error);
        }
        newAuthor = req.body;
        let statement: Statement = await db.prepare("INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)");
        await statement.bind([null, newAuthor.name, newAuthor.bio]);
        let result: ISqlite.RunResult = await statement.run();
        let newID: number|undefined = result.lastID;
        insertedAuthor = (await db.all(`SELECT * FROM AUTHORS WHERE ID=${newID}`))[0];
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
    return res.status(201).json(insertedAuthor);
})

app.delete("/api/authors/:id", async (req: DeleteRequest, res) => {
    try {
        let exists: Author[] = await db.all(`SELECT * FROM AUTHORS WHERE ID=${req.params.id}`);
        if (exists.length == 0) {
            return res.sendStatus(404)
        }
        let hasBooks: Book[] = await db.all(`SELECT * FROM BOOKS WHERE AUTHOR_ID=${req.params.id}`);
        if (hasBooks.length != 0) {
            return res.status(403).json({ error: "Author still has books associated, please delete those first" });
        }
        await db.all(`DELETE FROM AUTHORS WHERE ID=${req.params.id}`);
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
    return res.sendStatus(204);
})

app.delete("/api/books/:id", async (req: DeleteRequest, res) => {
    try {
        let exists: Book[] = await db.all(`SELECT * FROM BOOKS WHERE ID=${req.params.id}`);
        if (exists.length == 0) {
            return res.sendStatus(404)
        }
        await db.all(`DELETE FROM BOOKS WHERE ID=${req.params.id}`);
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
    return res.sendStatus(204);
})

let port: number = 3000;
let host: string = "localhost";
let protocol: string = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
