import { useEffect, useState } from "react";
import { NewAuthor, getAxiosErrorMessages } from "./utils";
import axios from "axios";
import { Alert, Button, Snackbar, TextField } from "@mui/material";

axios.defaults.baseURL = "http://localhost:3000";

function AddAuthor() {
    let [messages, setMessages] = useState<string[]>([]);
    let [name, setName] = useState<string>("");
    let [bio, setBio] = useState<string>("");
    let [openSuc, setOpenSuc] = useState<boolean>(false);
    let [openFail, setOpenFail] = useState<boolean>(false);

    useEffect(() => {
        setMessages([]);
    }, [name, bio]);
    
    let handleSubmit = async function () {
        try {
            let newAuthor: NewAuthor = { "name": name, "bio": bio };
            let res = await axios.post("/api/authors", newAuthor);
            if (res.status !== 201) {
                setMessages([...res.data, "Are you sure all the parameters are valid?", "(Did you select a genre? Is the AuthorID valid?)"]);
                setOpenFail(true);
            }
            setMessages(["Author successfully added!"]);
            setOpenSuc(true);
        } catch (error) {
            setMessages(getAxiosErrorMessages(error));
            setOpenFail(true);
        }
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSuc(false);
        setOpenFail(false);
      };

    return (
        <>
            <h2>Add an Author:</h2>
            <div className="add-container">
                <TextField id="name-input" label="Name" variant="standard" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                <TextField id="bio-input" label="Bio" variant="standard" type="text" value={bio} onChange={(e) => setBio(e.target.value)}/>
                <Button variant="contained" onClick={handleSubmit}>Add Author</Button>
            </div>
            <Snackbar open={openSuc} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {messages.map((message, i) => (
                        <div key={i}>{message}</div>
                    ))}
                </Alert>
            </Snackbar>
            <Snackbar open={openFail} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {messages.map((message, i) => (
                        <div key={i}>{message}</div>
                    ))}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AddAuthor;