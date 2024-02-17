import express, { Request, Response, RequestHandler, CookieOptions } from "express";
import sqlite3 from "sqlite3";
import { Database, ISqlite, Statement, open } from "sqlite";
import * as url from "url";
import { z } from "zod";
import cors from "cors";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import * as argon2 from "argon2";
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { EmptyResponse, MessageResponse, Error, Genre, Book, Author, NewBook, NewAuthor, BookResponse, BooksResponse, AuthorResponse, AuthorsResponse, AuthorsGetRequest, AuthorRequest, BooksGetRequest, BookRequest, DeleteRequest, newAuthorBodySchema, newBookBodySchema, bookBodySchema, authorBodySchema, genres, loginSchema } from "./types.js"

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})

app.use(limiter);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  }));

let __dirname: string = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile: string = `${__dirname}database.db`;
let db: Database = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

let cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
};

function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}

let authorize: RequestHandler = async (req: Request, res, next) => {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    let selectedToken = await db.all(`SELECT TOKEN FROM TOKENS WHERE TOKEN='${token}'`);
    if (selectedToken === undefined) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    next();
};

app.post("/api/login", async (req: Request, res: Response<MessageResponse>) => {
    let parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res
            .status(400)
            .json({ message: "Zod Type Error: Username or password invalid" });
    }
    let { username, password } = parseResult.data;
    let token: string;

    if (username === await db.get<string>(`SELECT USERNAME FROM TOKENS WHERE USERNAME='${username}'`)) {
        throw new Error();
    }
    
    try {
        let retrievedUsername = (await db.get(`SELECT USERNAME FROM USERS WHERE USERNAME='${username}'`)).username;
        let retrievedPassword = (await db.get(`SELECT PASSWORD FROM USERS WHERE USERNAME='${retrievedUsername}'`)).password;
        if (retrievedUsername === undefined || !(await argon2.verify(retrievedPassword, password))) {
            throw new Error();
        }
        token = makeToken();
        let statement: Statement = await db.prepare("INSERT INTO TOKENS(id, username, token) VALUES(?, ?, ?)");
        await statement.bind([null, username, token]);
        await statement.run();

        return res.status(200).cookie("token", token, cookieOptions).json();
    } catch (err) {
        let error = err as Object;
        return res.status(400).json({ message: error.toString() });
    }

});
app.post("/api/logout", async (req: Request, res: Response<EmptyResponse>) => {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.send();
    }
    let queriedToken: string | undefined = await db.get(`SELECT TOKEN FROM TOKENS WHERE TOKEN='${token}'`);
    if (queriedToken !== undefined) {
        await db.run(`DELETE FROM TOKENS WHERE TOKEN='${token}'`);
        return res.clearCookie("token", cookieOptions).send();
    }
    return res.send();
});

app.get("/api/logincheck", async (req, res) => {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.sendStatus(401);
    }
    let storedSession: { token: string, username: string } | undefined = await db.get(`SELECT * FROM TOKENS WHERE TOKEN='${token}'`);
    if (storedSession === undefined || storedSession.token === undefined) {
        return res.status(401).clearCookie("token", cookieOptions).send();
    }
    return res.status(200).send(storedSession.username);
})

app.post("/api/signup", async (req, res) => {
    // Perform zod schema validation
    let { username, password } = req.body;
    let duplicate: string | undefined = await db.get(`SELECT USERNAME FROM USERS WHERE USERNAME='${username}'`);
    if (duplicate === undefined) {
        try {
            let hashedPassword = await argon2.hash(password);
            let statement: Statement = await db.prepare("INSERT INTO USERS(id, username, password) VALUES(?, ?, ?)");
            await statement.bind([null, username, hashedPassword]);
            await statement.run();
            res.sendStatus(200);
        } catch (err) {
            let error = err as Object;
            res.status(400).json({ error: error.toString() });
        }
    }
    else {
        res.status(400).json({ error: "Username already exists" });
    }
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

app.post("/api/books", authorize, async (req: BookRequest, res: BookResponse) => {
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

app.post("/api/authors", authorize, async (req: AuthorRequest, res: AuthorResponse) => {
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

app.delete("/api/authors/:id", authorize, async (req: DeleteRequest, res) => {
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

app.delete("/api/books/:id", authorize, async (req: DeleteRequest, res) => {
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

app.put("/api/books/:id", authorize, async (req, res) => {
    try {
        let parseResult = bookBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw parseError(parseResult.error);
        }
        let newBook: Book = req.body;
        await db.run(`UPDATE BOOKS SET TITLE='${newBook.title}', AUTHOR_ID='${newBook.author_id}', PUB_YEAR='${newBook.pub_year}', GENRE='${newBook.genre}' WHERE ID='${req.params.id}'`);
        let resBook: Book | undefined = await db.get(`SELECT * FROM BOOKS WHERE ID='${newBook.id}'`);
        return res.status(201).json(resBook);
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
})

app.put("/api/authors/:id", authorize, async (req, res) => {
    try {
        let parseResult = authorBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw parseError(parseResult.error);
        }
        let newAuthor: Author = req.body;
        await db.run(`UPDATE AUTHORS SET NAME='${newAuthor.name}', BIO='${newAuthor.bio}' WHERE ID='${req.params.id}'`);
        let resAuthor: Author | undefined = await db.get(`SELECT * FROM AUTHORS WHERE ID='${newAuthor.id}'`);
        return res.status(201).json(resAuthor);
    } catch (error) {
        let err = error as Object;
        return res.status(400).json({ error: err.toString() });
    }
})

let port: number = 3000;
let host: string = "localhost";
let protocol: string = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
