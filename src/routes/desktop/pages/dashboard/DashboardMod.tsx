import { Outlet, useLocation, useNavigate } from "react-router-dom"
import book from "../../../../assets/book.jpg"
import { useEffect } from "react"
import store from "../../../../utils/store";
import { observer } from "mobx-react-lite";

function _DashboardMod(){

    const location = useLocation();
    const navigate = useNavigate()

    useEffect(()=>{
        if(location.pathname == "/dashboard/mod"){
            navigate("/dashboard/mod/reviews");
        }
    },[])

    async function logout() {
        await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        store.fetchUser();
        navigate("/")
    }

    let navs = [
        {to: "./reviews", text: "Объявления"},
        {to: "./disputes", text: "Споры"},
    ]

    return(
    <div className="w-full flex flex-row gap-2">
        <div className="w-1/5 pl-2 flex flex-col items-center gap-4">
            <img className="w-[125px] h-[125px] border-dark border-[1px] rounded-full" src={`/${store.getUserData()?.avatarUrl}`}/>
            <span className="text-2xl">{store.getUserData()?.name}</span>
            <div className="flex flex-col py-6 border-[1px] border-gray-400 gap-2 bg-bright text-xl rounded-lg">
                {navs.map((nav, i)=><button className="px-12 py-2 cursor-pointer hover:bg-white"
                key={i} onClick={()=>navigate(nav.to)}>{nav.text}</button>)}
            </div>
            <button className="cursor-pointer hover:text-white py-1 px-8 rounded-lg bg-lbrown text-xl" onClick={()=>logout()}>Выйти</button>
        </div>
        <div className="w-3/4 flex flex-col pr-12">
            <Outlet/>
        </div>
    </div>
    )
}

const DashboardMod = observer(_DashboardMod)
export default DashboardMod;