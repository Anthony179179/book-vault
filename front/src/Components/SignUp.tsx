import { Alert, Button, Input, Snackbar } from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";


function SignUp() {

    let [username, setUsername] = useState<string>("");
    let [password, setPassword] = useState<string>("");
    let [message, setMessage] = useState<string>("");

    let [open, setOpen] = useState<boolean>(false);

    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    async function signup() {
        try {
            let res = await axios.post("/api/signup", { username: username, password: password });
            if (res.status === 200) {
                let loginres = await axios.post("/api/login", { username: username, password: password });
                if (loginres.status === 200) {
                    setAuth(true);
                    navigate("/");
                }
                else {
                    setAuth(false);
                    throw new Error();
                }
            }
            else {
                setOpen(true);
            }
        } catch (error) {
            let err = error as Object;
            setMessage(err.toString());
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
            <Button onClick={signup}>Sign Up</Button>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Username is already taken
                </Alert>
            </Snackbar>
            <h2>{message}</h2>
        </div>
    )
}

export default SignUp;