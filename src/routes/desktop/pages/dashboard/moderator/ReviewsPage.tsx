import React, { useEffect, useState } from 'react'
import book from "../../../../../assets/book.jpg"
import { ListingData } from '../../../../../utils/dataModels'
import { useNavigate } from 'react-router-dom'

export default function ReviewsPage() {

    const [listings, setListings] = useState<ListingData[]>([])

    useEffect(()=>{
        fetchListings()
    },[])

    const fetchListings = async () => {
        let res = await fetch("/api/m/listings");
        let body = await res.json();
        setListings(body);
    }

    return (
        <div className='flex flex-col gap-4'>
            <h1 className="text-2xl font-bold">Объявления</h1>
            {listings.map((l, i)=><Review listing={l} key={i} refetch={fetchListings}/>)}
        </div>
    )
}

function Review({listing, refetch}:{listing: ListingData, refetch: ()=>void}) {

    const navigate = useNavigate()

    const statuses = {
        'pending': "На рассмотрении" ,
        'approved': "Опубликовано" ,
        'rejected': "Отклонено"
    }

    async function publishListing(){
        let res = await fetch(`/api/m/publish/${listing.id}`,
         {method: "PUT"})
        let body = await res.json()
        alert(body.message);
        refetch()
    }

    async function rejectListing(){
        const result = prompt("Причина удаления?")
        if(!result){
            return;
        }
        let res = await fetch(`/api/m/reject/${listing.id}`,
         {method: "PUT", headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({rejectionReason: result})})
        let body = await res.json()
        alert(body.message);
        refetch()
    }

    return (
        <div className="bg-bright p-4 rounded-lg shadow-lg mt-4">
            <div className="flex w-full justify-between items-center mb-4">
                <h1 className="text-2xl text-lbrown font-medium text-brown-600">
                    {listing.title}
                </h1>
                <button className="border border-lbrown text-lg cursor-pointer hover:bg-lbrown hover:text-white rounded-full px-6 py-1">
                    Написать
                </button>
            </div>
            <div className="flex">
                <div className="w-1/3 rounded-lg flex items-center justify-center">
                    <img alt="Фотография" className="w-[420px] h-[420px] rounded-lg object-cover" height="150" src={`/${listing.img}`} width="150" />
                </div>
                <div className="w-2/3 pl-4">
                    <div className="mb-4 text-xl">
                        <p className="flex gap-3">
                            <span className="font-semibold">Продавец:</span>
                            <span>{listing.sellerName}</span>
                        </p>
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
                </div>
            </div>
            <div className='flex flex-row justify-between'>
                <div className="mt-4 w-1/3 ml-8 text-lg">
                    <h2 className="text-xl font-semibold">Характеристики</h2>
                    <ul className="list-disc list-inside">
                        <li>Автор {listing.author}</li>
                        <li>Год издания {listing.publicationYear}</li>
                        <li>Жанр {listing.genre}</li>
                        <li>Сумма залога {Number(listing.deposit).toFixed(0)}</li>
                    </ul>
                </div>
                <div className="flex text-lg gap-10 w-2/3 flex-row items-center mt-4">
                    <div className='flex flex-col gap-4 ml-auto items-center'>
                        <p className=''>
                            <span className="font-semibold mr-2">Стоимость:</span>
                            <span>{listing.salePrice}</span>
                        </p>
                        <button onClick={publishListing} className="border text-xl border-dark bg-green-400 rounded-full px-7 py-2 cursor-pointer hover:bg-green-700 hover:text-white ">
                            Опубликовать
                        </button>
                    </div>
                    <div className='flex flex-col gap-4 mr-8 items-center'>
                        <p className=''>
                            <span className="font-semibold mr-2">Аренда:</span>
                            <span>{`${(Number(listing.rentPricePerMonth) + Number(listing.deposit)).toFixed(0)} ₽ (с учетом залога - ${Number(listing.deposit).toFixed(0)} ₽)`}</span>
                        </p>
                        <button onClick={rejectListing} className="border text-xl border-dark bg-red-400 rounded-full px-7 py-2 cursor-pointer hover:bg-red-700 hover:text-white ">
                            Отклонить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
