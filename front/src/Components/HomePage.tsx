import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";

function HomePage() {
    const [homeMessage, setHomeMessage] = useState<string>("");

    const { auth, user } = useContext(AuthContext);

    useEffect(() => {
        auth ? setHomeMessage(`Welcome, ${user}!`) : setHomeMessage("You're logged out");
    }, [auth, user]);

    return <h2>{homeMessage}</h2>
}

export default HomePage;