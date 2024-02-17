import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import AuthProvider from "./useAuth";
import { useContext } from "react";
import { AuthContext } from "./authContext";
import LoggedOutNavBar from "./LoggedOutNavBar";
import axios from "axios";

function Layout() {

    axios.defaults.validateStatus = () => true;
    axios.defaults.withCredentials = true;

    function App() {

        const { auth, setAuth } = useContext(AuthContext);

        window.onload = async () => {
            let res = await axios.get("/api/logincheck");
            if (res.status !== 401) {
                setAuth(true);
            }
        }

        return (
            <>
                {auth ? <NavBar /> : <LoggedOutNavBar />}
                <main>
                    <Outlet />
                </main>
            </>
        )
    }
    
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

export default Layout;