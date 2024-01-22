import axios, { AxiosError, AxiosResponse } from "axios";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Author, Book, NewAuthor, NewBook } from "./server.js";

let port: number = 3000;
let host: string = "localhost";
let protocol: string = "http";
let baseUrl: string = `${protocol}://${host}:${port}`;

axios.defaults.baseURL = baseUrl;

sqlite3.verbose();
let db: any;
const initDatabase = async () => {
    if (!db) {
        db = await open<sqlite3.Database, sqlite3.Statement>({
            filename: "database.db",
            driver: sqlite3.Database
        });
    }
}

let initialData: { books: [Book], authors: [Author] };

beforeEach(async () => {
    await initDatabase();
    initialData = { books: await db.all("SELECT * FROM books"), authors: await db.all("SELECT * FROM authors") };
})

test("GET /books returns list of all books", async () => {
    let response = await axios.get("/books");
    expect(response.data).toEqual(initialData.books);
})

test("GET /books/validID returns correct book", async () => {
    let bookID: number = 1;
    let response: AxiosResponse<Book> = await axios.get(`/books/${bookID}`);
    expect(response.data).toEqual(initialData.books.filter((book) => book.id == bookID)[0]);
}) 

test("Query strings work correctly", async () => {
    try {
        let response: AxiosResponse<Book[]> = await axios.get("/books?genre='fantasy'&&author_id=2&&pub_year=2009");
        let book: Book = (await axios.get("/books?title='Alas Negras'")).data[0];
        expect(response.data.length).toEqual(1);
        expect(response.data[0]).toEqual(book);
        let queriedAuthor: Author = (await axios.get("/authors?name='Laura Gallego'")).data[0];
        expect(queriedAuthor).toEqual(initialData.authors.filter((author) => author.name == 'Laura Gallego')[0])
        await axios.get("/books?name='Alas Negras'"); // Test invalid query parameter: name
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
    }
})

test("GET /books/invalidID returns error", async () => {
    let invalidBookID: number = 222;
    try {
        await axios.get(`/books/${invalidBookID}`);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(404);
        expect(response.data).toEqual({ error: `No book was found with ID: ${invalidBookID}` });
    }
})

test("GET /authors returns list of all authors", async () => {
    let response: AxiosResponse<Author[]> = await axios.get("/authors");
    expect(response.data).toEqual(initialData.authors);
})

test("GET /authors/validID returns correct author", async () => {
    let authorID: number = 1;
    let response: AxiosResponse<Author> = await axios.get(`/authors/${authorID}`);
    expect(response.data).toEqual(initialData.authors.filter((author) => author.id == authorID)[0]);
}) 

test("GET /authors/invalidID returns error", async () => {
    let invalidAuthorID: number = 177;
    try {
        await axios.get(`/authors/${invalidAuthorID}`);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(404);
        expect(response.data).toEqual({ error: `No author was found with ID: ${invalidAuthorID}` });
    }
}) 

test("POST /authors works as expected and returns new author with automatically assigned ID", async () => {
    let newAuthor: NewAuthor = { name: "Tonke Dragt", bio: "Dutch writer and illustrator" }
    let response: AxiosResponse<Author> = await axios.post("/authors", newAuthor);
    let confirmation: AxiosResponse<Author> = await axios.get(`/authors/${response.data.id}`);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(confirmation.data);
})

test("POST /authors invalid object shape returns error", async () => {
    let invalidAuthor: { nimm: string, bio: string } = { nimm: "This isn't right", bio: "This bio is ok" }
    try {
        await axios.post("/authors", invalidAuthor);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
    }
})

test("POST /books valid authorID works as expected and returns new book with automatically assigned ID", async () => {
    let newBook: NewBook = { author_id: 2, title: "Finis Mundi", pub_year: 1999, genre: "fiction" };
    let response: AxiosResponse<Book> = await axios.post("/books", newBook);
    let confirmation: AxiosResponse<Book> = await axios.get(`/books/${response.data.id}`);
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(confirmation.data);
}) 

test("POST /books invalid authorID returns error", async () => {
    let invalidBook: NewBook = { author_id: 179, title: "Invalid Author Book", pub_year: 1987, genre: "mystery" }
    try {
        await axios.post("/books", invalidBook);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
    }
}) 

test("POST /books invalid object shape returns error", async () => {
    let invalidBook: { author_id: number, pubbb_year: number, title: string, genre: string } = { author_id: 2, pubbb_year: 1977, title: "Invalid book", genre: "biography" }
    try {
        await axios.post("/books", invalidBook);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
    }
})

test("POST /books invalid book genre returns error", async () => {
    let invalidBook: { author_id: number, pub_year: number, title: string, genre: string } = { author_id: 1, pub_year: 1977, title: "Invalid genre", genre: "idk" }
    try {
        await axios.post("/books", invalidBook);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
    }
}) 

test("DELETE /authors/validID with no books in db works as expected", async () => {
    await axios.post("/authors", { name: "Deleted", bio: "She will be deleted" });
    let authorToDelete: Author = (await axios.get("/authors?name='Deleted'")).data[0];
    let deleteResponse: AxiosResponse<null> = await axios.delete(`/authors/${authorToDelete.id}`);
    try {
        await axios.get(`/authors/${authorToDelete.id}`);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(deleteResponse.status).toEqual(204);
        expect(response.status).toEqual(404);
    }
}) 

test("DELETE /authors/validID with books still in db returns error", async () => {
    let authorPostResponse: AxiosResponse<Author> = await axios.post("/authors", { name: "Book Expert", bio: "She has published many books" });
    let newAuthorID: number = authorPostResponse.data.id;
    await axios.post("/books", { author_id: newAuthorID, title: "How I became an expert author", pub_year: 2020, genre: "biography" });
    try {
        await axios.delete(`/authors/${newAuthorID}`);
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(403);
        expect(response.data).toEqual({ error: "Author still has books associated, please delete those first" });
    }
}) 

test("DELETE /authors/invalidID returns error", async () => {
    try {
        await axios.delete("/authors/234");
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(404);
    }
}) 

test("DELETE /books/validID works as expected", async () => {
    await axios.post("/authors", { name: "Newbie", bio: "She has not published any books yet" });
    let newAuthorID: number = (await axios.get("/authors?name='Newbie'")).data[0].id;
    let postResponse: AxiosResponse<Book> = await axios.post("/books", { author_id: newAuthorID, title: "My First Book!", pub_year: 2023, genre: "biography" })
    let deleteResponse: AxiosResponse<null> = await axios.delete(`/books/${postResponse.data.id}`);
    expect(postResponse.status).toEqual(201);
    expect(deleteResponse.status).toEqual(204);
}) 

test("DELETE /books/invalidID returns error", async () => {
    try {
        await axios.delete("/books/180");
    } catch (error) {
        let errorObj = error as AxiosError;
        if (errorObj.response === undefined) {
            throw Error("Server never sent response");
        }
        let { response } = errorObj;
        expect(response.status).toEqual(404);
    }
}) 
