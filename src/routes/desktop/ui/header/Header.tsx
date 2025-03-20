import { useNavigate } from 'react-router-dom';
import logo from "../../../../assets/logo.png"
import { observer } from "mobx-react-lite"
import { useState } from 'react';
import store from '../../../../utils/store';

function _Header() {
    const navigate = useNavigate();

    return (<header className="h-[55px] drop-shadow-md px-[5%] text-black bg-main w-full flex items-center">
        <div onClick={() => navigate("/")} className='flex group flex-row gap-2 items-center cursor-pointer'>
            <img className='w-[55px] h-[55px] group-hover:invert' src={logo} />
            <h1 className="text-4xl drop-shadow-lg group-hover:text-white">LitFond</h1>
        </div>
        {store.getAuthorized()
        ? <div className='text-xl flex flex-row items-center ml-auto gap-6'>
            {!store.getUserData()?.verificated?<button onClick={() => navigate("/verify")} 
            className='px-3 py-1 bg-red-300 hover:underline hover:bg-red-400 hover:text-white cursor-pointer rounded-lg text-white'>
                Вам нужно подтвердить почту.
            </button>:<></>}
            <h2 className='hover:underline cursor-pointer' onClick={()=>navigate("/dashboard/balance")}>Баланс: {store.getUserData().balance}</h2>
            <h2 onClick={() => navigate("/dashboard")} className='px-3 py-1 bg-white hover:underline hover:bg-lbrown hover:text-white cursor-pointer rounded-lg text-brown'>Личный кабинет</h2>
        </div>
        : <div className='text-xl flex flex-row items-center ml-auto gap-6'>
                <h2 onClick={() => navigate("/about")} className='cursor-pointer hover:text-white'>О платформе</h2>
                <h2 onClick={() => navigate("/auth")} className='px-3 py-1 bg-white hover:underline hover:bg-lbrown hover:text-white cursor-pointer rounded-lg text-brown'>Вход и регистрация</h2>
        </div>
        }

    </header>)
}

let Header = observer(_Header);
export default Header;

