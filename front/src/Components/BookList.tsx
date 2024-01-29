import { Book, Author, getAxiosErrorMessages, genres } from "./utils"
import { useState, useEffect } from "react"
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

interface bookSearchParams {
    title: string | undefined,
    author: string | undefined,
    pub_year: number | undefined,
    genre: string
}

function BookList() {

    let [books, setBooks] = useState<Book[]>([]);
    let [authors, setAuthors] = useState<Author[]>([]);
    let [messages, setMessages] = useState<string[]>([]);

    let [bookTitle, setBookTitle] = useState<string>("");
    let [bookAuthorName, setBookAuthorName] = useState<string>("");
    let [bookPubYear, setBookPubyear] = useState<number>(NaN);
    let [bookGenre, setBookGenre] = useState<string>("none");

    let [bookSearchParams, setBookSearchParams] = useState<bookSearchParams>();

    useEffect(() => {
        (async () => {
            try {
                let booksResponse = await axios.get<Book[]>("/api/books");
                let authorsResponse = await axios.get<Author[]>("/api/authors");
                setBooks(booksResponse.data.sort((a, b) => a.title.localeCompare(b.title)));
                setAuthors(authorsResponse.data);
                setMessages([]);
                if (bookSearchParams != undefined) {
                    setBooks((books) => books.filter((book) => 
                        (bookGenre == "none" || book.genre == bookGenre) && 
                        (bookTitle == "" || book.title.toLowerCase() == bookTitle.toLowerCase()) &&
                        (Number.isNaN(bookPubYear) || book.pub_year == bookPubYear) &&
                        (bookAuthorName == "" || book.author_id === authors.filter((author) => author.name == bookAuthorName).map((author) => author.id)[0])
                    ));
                }
            } catch (error) {
                setMessages(getAxiosErrorMessages(error));
            }           
        })();
    }, [bookSearchParams]);

    function handleFilter() {
        setBookSearchParams({ title: bookTitle, author: bookAuthorName, pub_year: bookPubYear, genre: bookGenre });
    }

    function resetFilter() {
        setBookSearchParams(undefined);
    }

    return (
        <>
            <h2>Books:</h2>
            <label>
                Title:
                <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => {
                        setBookTitle(e.target.value);
                    }}
                ></input>
            </label>
            <label>
                Author Name:
                <input
                    type="text"
                    value={bookAuthorName}
                    onChange={(e) => {
                        setBookAuthorName(e.target.value);
                    }}
                ></input>
            </label>
            <label>
                Publication Year:
                <input
                    type="number"
                    value={bookPubYear}
                    onChange={(e) => {
                        setBookPubyear(parseInt(e.target.value));
                    }}
                ></input>
            </label>
            <label>
                Genre:
                <select 
                    value={bookGenre}
                    onChange={(e) => {
                    setBookGenre(e.target.value);
                }}>
                    <option value={"none"}>none</option>
                    {genres.map((genre, i) => (
                        <option key={i} value={genre}>{genre}</option>
                    ))}
                </select>
            </label>
            <button onClick={handleFilter}>Filter Books</button>
            <button onClick={resetFilter}>Reset Filters</button>
            <table>
                <thead>
                    <tr>
                        {/* <th>ID</th> */}
                        <th>Title</th>
                        <th>Author</th>
                        <th>Publication Year</th>
                        <th>Genre</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(({ id, author_id, title, pub_year, genre }) => (
                        <tr>
                            {/* <td key={`${id}-id`}>{id}</td> */}
                            <td key={`${id}-title`}>{title}</td>
                            {authors.filter((author) => (
                                author.id == author_id
                            )).map((author) => (
                                <td key={`${id}-author`}>{author.name}</td>
                            ))}
                            <td key={`${id}-pub_year`}>{pub_year}</td>
                            <td key={`${id}-genre`}>{genre}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
            <h2>Authors:</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Bio</th>
                    </tr>
                </thead>
                <tbody>
                    {authors.map(({ id, name, bio }) => (
                        <tr>
                            <td key={`${id}-id`}>{id}</td>
                            <td key={`${id}-name`}>{name}</td>
                            <td key={`${id}-bio`}>{bio}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default BookList;