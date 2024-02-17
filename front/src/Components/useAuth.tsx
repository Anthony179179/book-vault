import axios from "axios";
import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";

const AuthProvider = ({ children }: any) => {
    
    const [auth, setAuth] = useState<boolean | null>(null);
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const isAuth = async () => {
            try {
                console.log("HIII");
                const res = await axios.get("/api/logincheck");
                if (res.status === 200) {
                    setUser(res.data);
                }
            } catch (error) {
                let err = error as Object;
                console.log(err.toString())
                setUser(null);
            };
        };

        isAuth();
    }, [auth]);

    return (
        <AuthContext.Provider value={{auth, setAuth, user}}>
            { children }
        </AuthContext.Provider>
    )
}

export default AuthProvider;
