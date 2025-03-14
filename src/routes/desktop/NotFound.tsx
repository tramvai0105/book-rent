import Header from "./ui/header/Header";
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="w-full inter h-fit min-h-[100vh] flex flex-col bg-white">
            <Header />
            <div className="w-full h-[80vh] text-4xl flex items-center gap-4 justify-center">
                Похоже тут ничего нет... <button className="cursor-pointer underline text-5xl text-lbrown" onClick={()=>navigate("/")}>На главную!</button>
            </div>
        </div>)
}