import { AppBar } from "@mui/material";
import { Link, Outlet } from "react-router-dom";

function Header() {
    return (
        <>
            <Link to="/">Home</Link>
            <Link to="/books">Search for Books</Link>
            <Link to="/addbook">Add New Book</Link>
            <Link to="addauthor">Add New Author</Link>
        </>
    );
}

function Layout() {
    return (
        <>
            <AppBar position="static" sx={{ display: "flex", flexFlow: "row", alignItems: "center", gap: "4vw", width: "95vw", height: "3rem", paddingLeft: "3vw"}}>
                <h3>Book Database</h3>
                <Link to="/">Home</Link>
                <Link to="/books">Search for Books</Link>
                <Link to="/addbook">Add New Book</Link>
                <Link to="addauthor">Add New Author</Link>
            </AppBar>
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default Layout;