import { useEffect, useState } from "react";
import { NewAuthor, getAxiosErrorMessages } from "./utils";
import axios from "axios";
import { Button, TextField } from "@mui/material";

axios.defaults.baseURL = "http://localhost:3000";

function AddAuthor() {
    let [messages, setMessages] = useState<string[]>([]);
    let [name, setName] = useState<string>("");
    let [bio, setBio] = useState<string>("");

    useEffect(() => {
        setMessages([]);
    }, [name, bio]);
    
    let handleSubmit = async function () {
        try {
            let newAuthor: NewAuthor = { "name": name, "bio": bio };
            await axios.post("/api/authors", newAuthor);
            setMessages(["Author successfully added!"]);
        } catch (error) {
            setMessages(getAxiosErrorMessages(error));
        }
    }

    return (
        <>
            <h2>Add an Author:</h2>
            <div className="add-container">
                <TextField id="name-input" label="Name" variant="standard" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                <TextField id="bio-input" label="Bio" variant="standard" type="text" value={bio} onChange={(e) => setBio(e.target.value)}/>
                <Button variant="contained" onClick={handleSubmit}>Add Author</Button>
            </div>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
        </>
    )
}

export default AddAuthor;