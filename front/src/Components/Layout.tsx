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
            <nav>
                <Header />
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default Layout;