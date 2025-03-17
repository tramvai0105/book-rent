import Login from "./Login";
import Logout from "./Logout";
import Registration from "./Registration";

export default function AuthPage(){
    return(
        <>
        <Registration/>
        <Login/>        
        <Logout/>
        </>
    )
}