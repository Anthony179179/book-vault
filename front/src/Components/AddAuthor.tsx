import { useEffect, useState } from "react";
import { NewAuthor, getAxiosErrorMessages } from "./utils";
import axios from "axios";

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
            <label>
                Name: 
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                ></input>
            </label>
            <label>
                Bio: 
                <input
                    type="text"
                    name="bio"
                    value={bio}
                    onChange={(e) => {
                        setBio(e.target.value);
                    }}
                ></input>
            </label>
            <button onClick={handleSubmit}>Add Author</button>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
        </>
    )
}

export default AddAuthor;