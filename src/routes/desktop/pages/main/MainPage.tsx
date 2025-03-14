import BookCard from "./BookCard";
import SearchBar from "./SearchBar";
import SearchFilter from "./SearchFilter";

export default function MainPage(){
    return(<div className="w-full mt-8 gap-4 px-[3%] h-fit flex flex-col">
        <div className="flex flex-row gap-3">
            <div className="w-[320px]"></div>
            <SearchBar/>
        </div>
        <div className="flex flex-row w-full gap-3">
            <SearchFilter/> 
            <div className="w-[75%] grid grid-cols-3 gap-8">
                <BookCard/>
                <BookCard/>
                <BookCard/>
                <BookCard/>
                <BookCard/>
                <BookCard/>
            </div>
        </div>
    </div>)
}