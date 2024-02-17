import { Alert, Button, Input, Snackbar } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";


function LogIn() {

    let [username, setUsername] = useState<string>("");
    let [password, setPassword] = useState<string>("");
    let [message, setMessage] = useState<string>("");

    let [open, setOpen] = useState(false);

    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);

    useEffect(() => {
        async () => {
            if (auth) {
                navigate("/")
            }
        }
    }, [])

    async function login() {
        let response = await axios.post("/api/login", { username: username, password: password });
        if (response.status === 400) {
            setOpen(true);
            setMessage(response.data.error);
        }
        else if (response.status === 200) {
            setAuth(true);
            return navigate("/");
        }
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
      };

    return (
        <div className="container">
            <div>
                <label>Username: </label>
                <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                ></Input>
            </div>
            <div>
                <label>Password: </label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                ></Input>
            </div>
            <Button onClick={login}>Log In</Button>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Incorrect username or password
                </Alert>
            </Snackbar>
            <h2>{message}</h2>
        </div>
    )
}

export default LogIn;