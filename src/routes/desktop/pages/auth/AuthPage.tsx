import { useState } from "react";
import Login from "./Login";
import Registration from "./Registration";
import { useNavigate } from "react-router-dom";

export default function AuthPage(){

    const [regPage, setRegPage] = useState(false);
    const navigate = useNavigate();

    return(
        <div className="flex items-center justify-center min-h-[65vh] w-full h-full">
            <div className="flex text-lg gap-5 items-center rounded-xl flex-col px-14 py-24 bg-bright border-[1px] border-main">
                {regPage
                ?
                <>
                    <Registration/>
                    <button className="hover:underline cursor-pointer" onClick={()=>setRegPage(false)}>Уже есть аккаунт? Войти</button>
                </>
                :
                <>
                    <Login/>
                    <button className="hover:underline cursor-pointer" onClick={()=>setRegPage(true)}>Ещё нет аккаунта? Регистрация</button>
                </>
                }
                <button className="hover:underline cursor-pointer" onClick={()=>navigate("/recoverySend")}>Забыли пароль?</button>
            </div>
        </div>
    )
}