import { useNavigate } from "react-router-dom"
import React, { useEffect, useState } from "react"
import { ListingData } from "../../../../../utils/dataModels"
import BookImages from "../../../ui/BookImages"
import refresh from "../../../../../assets/refresh.svg"

const statuses = {
    'pending': "На рассмотрении",
    'approved': "Опубликовано",
    'process': "Активный",
    'rejected': "Отклонено",
    'closed': "Завершён",
}

export default function Listings() {
    const navigate = useNavigate()
    const [listings, setListings] = useState<ListingData[]>([])
    const [lFiltered, setLFiltered] = useState<ListingData[]>([])
    const [filterOption, setFilterOption] = useState("");

    useEffect(() => {
        fetchListings()
    }, [])

    useEffect(() => {
        if(filterOption){
            let _filtered = listings.filter((l)=> l.status == filterOption)
            setLFiltered(_filtered)
        }else{
            setLFiltered(listings)
        }
    }, [filterOption])

    const fetchListings = async () => {
        let res = await fetch("/api/private/listings");
        let body: ListingData[] = await res.json();
        let _listings = body.sort((a, b) => (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime());
        setListings(_listings);
        setLFiltered(_listings)
    }

    return (
        <>
            <div className="flex flex-row mt-6 gap-6 items-center px-6">
                <h1 className="text-2xl font-bold">Мои объявления</h1>
                <img onClick={fetchListings} className="h-[25px] w-[25px] cursor-pointer hover:rotate-180 transition-transform duration-300 mr-12" src={refresh} />
                <select onChange={(e)=>setFilterOption(e.target.value)}>
                    <option value={""}>Убрать фильтер</option>
                    {Object.entries(statuses).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </select>
                <button onClick={() => navigate("./new")} className="cursor-pointer ml-auto px-8 py-2 rounded-xl bg-lbrown text-xl 
                border-[1px] border-lbrown hover:text-white">Новое объявление</button>
            </div>
            <div className="w-full h-[1px] my-2 bg-dark"></div>
            <div>
                {lFiltered.map((l, i) => {
                    return (<React.Fragment key={i}><Listing refetch={fetchListings} listing={l} key={i} /><div className="w-full my-2 h-[1px] bg-dark"></div></React.Fragment>)
                })}
            </div>
        </>
    )
}

function Listing({ listing, refetch }: { listing: ListingData, refetch: () => void }) {
    const navigate = useNavigate()

    async function removeListing() {
        const result = confirm("Точно удалить объявление?")
        if (!result) {
            return;
        }
        let res = await fetch(`/api/private/listings/remove/${listing.id}`, { method: "DELETE" })
        let body = await res.json()
        alert(body.message);
        refetch()
    }

    return (
        <div className="px-4 py-6 flex border-[1px] border-dark rounded-2xl flex-row gap-4">
            <div className="w-2/5 flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <BookImages style="w-full rounded-lg h-[240px] object-cover" images={listing.img} />
                <div className="text-lg">
                    <h2 className="text-xl mb-2 font-semibold">Характеристики</h2>
                    <ul className="list-disc list-inside">
                        <li>Автор {listing.author}</li>
                        <li>Год издания {listing.publicationYear}</li>
                        <li>Жанр {listing.genre}</li>
                        <li>Сумма залога {Number(listing.deposit).toFixed(0)}</li>
                    </ul>
                </div>
            </div>
            <div className="w-3/5 mt-6 flex flex-col">
                <div className="bg-lbrown w-fit rounded-lg text-white px-4 text-lg py-1">Статус: {statuses[listing.status]}</div>
                <div className="mb-4 text-lg">
                    <p className="flex gap-3">
                        <span className="font-semibold">Номер телефона:</span>
                        <span>{listing.phoneNumber}</span>
                    </p>
                    <p className="flex gap-3">
                        <span className="font-semibold">Адресс встречи:</span>
                        <span>{listing.address}</span>
                    </p>
                    <p className="flex gap-3">
                        <span className="font-semibold">Город:</span>
                        <span>{listing.city}</span>
                    </p>
                </div>
                {listing.rejectionReason ? <div className="mb-4">
                    <p className="font-semibold">Причина отклонения</p>
                    <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{listing.rejectionReason}</div>
                </div> : <></>}
                <div className="mb-4">
                    <p className="font-semibold">Описание</p>
                    <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{listing.description}</div>
                </div>
                <div className="mb-4">
                    <p className="font-semibold">Состояние</p>
                    <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{listing.wealth}</div>
                </div>
                <div className="mb-4 flex flex-row text-lg gap-4">
                    {listing.interactionType == "rent" ? <div><span className="font-bold">Аренда:</span> {listing.rentPricePerMonth}</div> : <></>}
                    {listing.interactionType == "sale" ? <div><span className="font-bold">Цена:</span> {listing.salePrice}</div> : <></>}
                    {listing.interactionType == "rent" ? <div><span className="font-bold">Депозит:</span> {listing.deposit}</div> : <></>}
                </div>
                <div className="mt-auto ml-auto mb-4 mr-14 flex flex-row gap-8">
                    {listing.status != "closed" && listing.status != "process" ? <button onClick={() => navigate(`./edit/${listing.id}`)} className="border-dark cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-8 py-2">Редактировать</button> : <></>}
                    <button onClick={removeListing} className="border-dark cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-8 py-2">Удалить</button>
                </div>
            </div>
        </div>
    )
}