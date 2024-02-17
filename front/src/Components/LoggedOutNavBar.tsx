import { AppBar } from "@mui/material";
import { Link } from "react-router-dom";


function NavBar() {

    return (
        <>
            <AppBar position="static" sx={{ display: "flex", flexFlow: "row", alignItems: "center", gap: "4vw", width: "95vw", height: "3rem", paddingLeft: "3vw"}}>
                <h3>Book Database</h3>
                <Link to="/">Home</Link>
                <Link to="/books">Search for Books</Link>
                <Link to="/login">Log In</Link>
                <Link to="/signup">Sign Up</Link>
            </AppBar>
        </>
    );
}

export default NavBar;