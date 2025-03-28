import { use, useEffect, useState } from "react";
import BookCard from "./BookCard";
import SearchBar from "./SearchBar";
import SearchFilter from "./SearchFilter";
import { BookCardData } from "../../../../utils/dataModels";
import { useSearchParams } from "react-router-dom";

export interface Filter { 
    city: string; 
    priceFrom: string; 
    priceTo: string; 
    yearFrom: string; 
    yearTo: string; 
    serviceType: string; 
}

const _initFilter = {
    city: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    serviceType: "",
}

export default function MainPage() {
    const [bookCards, setBookCards] = useState<BookCardData[]>([]);
    const [filteredBookCards, setFilteredBookCards] = useState<BookCardData[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState<Filter>(_initFilter);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchBookCards = async () => {
            try {
                const name = searchParams.get('name');
                const response = await fetch(`/api/public/listings${name ? `?name=${encodeURIComponent(name)}` : ''}`);
                if (!response.ok) {
                    fetchBookCards()
                    return;
                }
                const data: BookCardData[] = await response.json();
                setBookCards(data);
            } catch (error) {
                console.log(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookCards();
    }, [searchParams]);

    function changeShowFilter(){
        setShowFilter(prev=>!prev);
    }

    useEffect(()=>{
        if(!showFilter){
            setFilter(_initFilter)
        }
    },[showFilter])

    const filterBookCards = () => {
        return bookCards.filter(card => {
            card.salePrice = Number(card.salePrice);
            card.rentPricePerMonth = Number(card.rentPricePerMonth);
            const matchesCity = filter.city ? card.city.toLowerCase().includes(filter.city.toLowerCase()) || filter.city.toLowerCase().includes(card.city.toLowerCase()) : true;
            console.log(matchesCity)
            const matchesYearFrom = filter.yearFrom ? card.publicationYear >= Number(filter.yearFrom) : true;
            const matchesYearTo = filter.yearTo ? card.publicationYear <= Number(filter.yearTo) : true;
            const matchesServiceType = filter.serviceType ? (card.interactionType === filter.serviceType || card.interactionType === "both") : true;

            let matchesPrice = true;
            if (card.rentPricePerMonth) {
                matchesPrice = (filter.priceFrom ? card.rentPricePerMonth >= Number(filter.priceFrom) : true) &&
                    (filter.priceTo ? card.rentPricePerMonth <= Number(filter.priceTo) : true);
            } else if (card.salePrice) {
                matchesPrice = (filter.priceFrom ? card.salePrice >= Number(filter.priceFrom) : true) &&
                    (filter.priceTo ? card.salePrice <= Number(filter.priceTo) : true);
            }
            return matchesCity && matchesYearFrom && matchesYearTo && matchesServiceType && matchesPrice;
        });
    };

    function filterSetter(k: any, v: any){
        setFilter(prev=>{return {...prev, [k]: v}})
    }

    useEffect(() => {
        setFilteredBookCards(filterBookCards());
    }, [bookCards]);

    useEffect(() => {
        setFilteredBookCards(filterBookCards());
    }, [filter]);

    return (
        <div className="w-full mt-8 gap-4 px-[3%] h-fit flex flex-col">
            <div className="flex flex-row w-full justify-center gap-3">
                <SearchBar csf={changeShowFilter}/>
            </div>
            {showFilter
            ?<div className="flex flex-row w-full gap-3">
                <SearchFilter setFilters={filterSetter} />
                <div className="w-[75%] grid grid-cols-3 gap-8">
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : (
                        filteredBookCards.map((card, i) => <BookCard key={i} card={card} />)
                    )}
                </div>
            </div>
            :<div className="flex flex-row w-full gap-3">
            <div className="w-full grid grid-cols-4 gap-8">
                {loading ? (
                    <p>Загрузка...</p>
                ) : (
                    filteredBookCards.map((card, i) => <BookCard key={i} card={card} />)
                )}
            </div>
        </div>}
        </div>
    );
}