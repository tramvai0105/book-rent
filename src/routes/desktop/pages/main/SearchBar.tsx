
export default function SearchBar(){
    return(
    <div className="flex flex-col items-start">
        <div className="flex text-xl drop-shadow-xl relative">
            <input placeholder="Поиск книг..." className={`w-[650px] h-[45px] pl-4 bg-white border-dark border-[1px] rounded-l-2xl`}/>
            <button className="h-[45px] bg-main px-6 hover:text-white cursor-pointer rounded-r-2xl">Поиск</button>
        </div>
        <button className="text-xl ml-4 bg-main rounded-b-xl px-4 pb-1 hover:text-white cursor-pointer">Фильтры</button>
    </div>
    )
}