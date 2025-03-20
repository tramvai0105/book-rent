import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchBar({csf}:{csf: ()=>void}) {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = () => {
        if (searchTerm) {
            navigate({
                pathname: location.pathname,
                search: `?name=${encodeURIComponent(searchTerm)}`,
            });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm(''); // Очищаем состояние поиска
        navigate(location.pathname); // Перенаправляем на ту же страницу без параметров
    };

    return (
        <div className="flex flex-col items-start">
            <div className="flex text-xl drop-shadow-xl relative">
                <input
                    placeholder="Поиск книг..."
                    className={`w-[650px] h-[45px] pl-4 bg-white border-dark border-[1px] rounded-l-2xl`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch} className="h-[45px] bg-main px-6 hover:text-white cursor-pointer rounded-r-2xl">Поиск</button>
            </div>
            <div className="flex flex-row gap-2 ml-4">
                <button onClick={csf} className="text-xl bg-main rounded-b-xl px-4 pb-1 hover:text-white cursor-pointer">Фильтры</button>
                <button onClick={handleClearSearch} className="text-xl bg-main rounded-b-xl px-4 pb-1 hover:text-white cursor-pointer">Очистить поиск х</button>
            </div>
        </div>
    );
}