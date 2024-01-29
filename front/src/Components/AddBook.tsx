import { useState, useEffect } from "react";
import axios from "axios";
import { genres, getAxiosErrorMessages } from "./utils"

axios.defaults.baseURL = "https://localhost:3000"

function AddBook() {
    let [authorID, setAuthorID] = useState<number>();
    let [title, setTitle] = useState<string>("");
    let [pubYear, setPubYear] = useState<number>();
    let [genre, setGenre] = useState<string>("");
    let [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        setMessages([]);
    }, [authorID, title, pubYear, genre]);

    async function handleSubmit() {
        try {
            let newBook = { "author_id": authorID, "title": title, "pub_year": pubYear, "genre": genre };
            await axios.post("/api/books", newBook);
            setMessages(["Book successfully added!"]);
        } catch (err) {
            let error = getAxiosErrorMessages(err);
            error[0] == "Server never sent response" ? setMessages(error) : setMessages([...error, "Are you sure all the parameters are valid?", "(Did you select a genre? Is the AuthorID valid?)"]);
        }
    }

    return (
        <>
            <h2>Add a book:</h2>
            <label>
                Author ID: 
                <input
                    type="number"
                    value={authorID}
                    onChange={(e) => {
                        setAuthorID(parseInt(e.target.value));
                    }}
                ></input>
            </label>
            <label>
                Title: 
                <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
                ></input>
            </label>
            <label>
                Publication Year: 
                <input
                    type="number"
                    value={pubYear}
                    onChange={(e) => {
                        setPubYear(parseInt(e.target.value));
                    }}
                ></input>
            </label>
            <label>
                Genre: 
                <select
                    value={genre}
                    onChange={(e) => {
                        setGenre(e.target.value);
                    }}
                >
                    <option value="">Select a genre</option>
                    {genres.map((genre, i) => (
                        <option key={i} value={genre}>{genre}</option>
                    ))}
                </select>
            </label>
            <button onClick={handleSubmit}>Add Book</button>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
        </>
    )
}

export default AddBook;