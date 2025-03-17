import { Outlet, useLocation, useNavigate } from "react-router-dom";
import store from "../../../../utils/store";
import DashboardUser from "./DashboardUser";
import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";

function _DashboardPage() {

    const [moderator, setModerator] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (store.getUserData() && store.getUserData().role === "moderator") {
            setModerator(true)
        }
    }, [store.userData])

    
    if(location.pathname.includes("/dashboard/mod")){
        return(<div className="flex flex-col w-full gap-2">
            <button className="px-6 py-2 border-dark mx-auto border-[1px] rounded-md 
            w-fit text-lg hover:bg-dark hover:text-white" 
            onClick={()=>navigate(".")}>Страница пользователя</button>
            <Outlet/>
        </div>)
    }

    if(moderator && location.pathname.includes("/dashboard")){
        return(<div className="flex flex-col w-full gap-2">
            <button className="px-6 py-2 border-dark mx-auto border-[1px] rounded-md 
            w-fit text-lg hover:bg-dark hover:text-white" 
            onClick={()=>navigate("./mod")}>Страница модератора</button>
            <Outlet/>
        </div>)
    }

    return (
        <Outlet/>
    )
}

const DashboardPage = observer(_DashboardPage)
export default DashboardPage;