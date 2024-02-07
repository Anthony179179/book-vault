import { useState, useEffect } from "react";
import axios from "axios";
import { genres, getAxiosErrorMessages } from "./utils"
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

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
            <div className="add-container">
                <TextField id="author-id-input" label="authorID" variant="standard" type="number" value={authorID} onChange={(e) => setAuthorID(parseInt(e.target.value))}/>
                <TextField id="title-input" label="Title" variant="standard" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                <TextField id="pub-year-input" label="Publication Year" variant="standard" type="number" value={pubYear} onChange={(e) => setPubYear(parseInt(e.target.value))}/>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="book-genre-select-label">Genre</InputLabel>
                    <Select
                        labelId="book-genre-select-label"
                        id="book-genre-select"
                        label="Genre"
                        value={genre}
                        onChange={(e) => {
                            setGenre(e.target.value);
                        }}
                    >
                        <MenuItem value={""}>Select a genre</MenuItem>
                        {genres.map((genre, i) => (
                            <MenuItem key={i} value={genre}>{genre}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleSubmit}>Add Book</Button>
            </div>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
        </>
    )
}

export default AddBook;