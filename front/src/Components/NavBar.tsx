import { AppBar } from "@mui/material";
import axios from "axios";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";


function NavBar() {

    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    async function logout() {
        let res = await axios.post("/api/logout");
        if (res.status === 200) {
            setAuth(false);
            navigate("/");
        }
    }

    return (
        <>
            <AppBar position="static" sx={{ display: "flex", flexFlow: "row", alignItems: "center", gap: "4vw", width: "95vw", height: "3rem", paddingLeft: "3vw" }}>
                <h3>Book Database</h3>
                <Link to="/">Home</Link>
                <Link to="/books">Search for Books</Link>
                <Link to="/addbook">Add New Book</Link>
                <Link to="/addauthor">Add New Author</Link>
                <h4 id="logout" onClick={logout}>Log Out</h4>
            </AppBar>
        </>
    );
}

export default NavBar;
