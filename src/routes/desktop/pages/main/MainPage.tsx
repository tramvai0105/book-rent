import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import SearchBar from "./SearchBar";
import SearchFilter from "./SearchFilter";
import { BookCardData } from "../../../../utils/interfaces";

export default function MainPage(){

    const [bookCards, setBookCards] = useState<BookCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookCards = async () => {
            try {
                const response = await fetch('/api/public/listings'); // Adjust the URL as needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: BookCardData[] = await response.json();
                setBookCards(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookCards();
    }, []);

    return(<div className="w-full mt-8 gap-4 px-[3%] h-fit flex flex-col">
        <div className="flex flex-row gap-3">
            <div className="w-[320px]"></div>
            <SearchBar/>
        </div>
        <div className="flex flex-row w-full gap-3">
            <SearchFilter/> 
            <div className="w-[75%] grid grid-cols-3 gap-8">
                {bookCards.map((card, i)=><BookCard key={i} card={card}/>)}
            </div>
        </div>
    </div>)
}