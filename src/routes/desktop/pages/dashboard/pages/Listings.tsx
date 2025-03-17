import { useNavigate } from "react-router-dom"
import book from "../../../../../assets/book.jpg"
import React, { useEffect, useState } from "react"
import { ListingData } from "../../../../../utils/interfaces"

export default function Listings() {
    const navigate = useNavigate()
    const [listings, setListings] = useState<ListingData[]>([])

    useEffect(()=>{
        const fetchListings = async () => {
            let res = await fetch("/api/private/listings");
            let body = await res.json();
            setListings(body);
        }
        fetchListings()
    },[])

    return (
        <>
            <div className="flex flex-row mt-6 justify-between px-6">
                <h1 className="text-2xl font-bold">Мои объявления</h1>
                <button onClick={()=>navigate("./new")} className="cursor-pointer px-8 py-2 rounded-xl bg-lbrown text-xl 
                border-[1px] border-lbrown hover:text-white">Новое объявление</button>
            </div>
            <div className="w-full h-[1px] my-2 bg-dark"></div>
            <div>
                {listings.map((l, i)=>{
                    return(<React.Fragment key={i}><Listing listing={l} key={i}/><div className="w-full my-2 h-[1px] bg-dark"></div></React.Fragment>)
                })}
            </div>
        </>
    )
}

function Listing({listing}:{listing: ListingData}) {
    return (
        <div className="px-4 py-6 flex border-[1px] border-dark rounded-2xl flex-row gap-4">
            <div className="w-2/5 flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <img className="w-full rounded-lg h-[240px] object-cover" src={`/${listing.img}`} />
                <div className="text-lg">
                    <h2 className="text-xl mb-2 font-semibold">Характеристики</h2>
                    <ul className="list-disc list-inside">
                        <li>Автор {listing.author}</li>
                        <li>Год издания {listing.publicationYear}</li>
                        <li>Жанр {listing.genre}</li>
                        <li>Сумма залога {listing.deposit}</li>
                    </ul>
                </div>
            </div>
            <div className="w-3/5 mt-6 flex flex-col">
                    <div className="mb-4 text-lg">
                        <p className="flex gap-3">
                            <span className="font-semibold">Номер телефона:</span>
                            <span>{listing.phoneNumber}</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="font-semibold">Город:</span>
                            <span>{listing.address}</span>
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Описание</p>
                        <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{listing.description}</div>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Состояние</p>
                        <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{listing.wealth}</div>
                    </div>
                    <div className="mt-auto ml-auto mb-4 mr-14 flex flex-row gap-8">
                        <button className="border-dark cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-8 py-2">Удалить</button>
                        <button className="border-dark cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-8 py-2">Редактировать</button>
                    </div>
            </div>
        </div>
    )
}