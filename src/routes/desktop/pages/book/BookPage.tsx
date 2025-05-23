import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import book from "../../../../assets/book.jpg";
import { BookData } from '../../../../utils/dataModels';
import store from '../../../../utils/store';
import OpenChat from '../../ui/OpenChat';
import BookImages from '../../ui/BookImages';

export default function BookPage() {
    const { id } = useParams();
    const [bookData, setBookData] = useState<BookData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const response = await fetch(`/api/public/listings/${id}`);
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных');
                }
                const data: BookData = await response.json();
                setBookData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookData();
    }, [id]);

    async function purchaseBook(){
        let res = await fetch("/api/b/purchaseBook", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({listingId: Number(id)}),
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
    }

    async function rentBook(){
        let res = await fetch("/api/b/rentBook", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({listingId: Number(id)}),
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
    }

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if(bookData === null){
        return <div>Загрузка задерживается... Обновите страницу.</div>;
    }

    return (
        <div className="bg-bright p-4 pb-8 rounded-lg shadow-lg w-[85%] mt-4">
            <div className="flex w-full justify-between items-center mb-4">
                <h1 className="text-2xl text-lbrown font-medium text-brown-600">
                {bookData.author} - {bookData.title}
                </h1>
                <OpenChat listingId={bookData.id}>
                    <button className="border border-lbrown text-lg cursor-pointer hover:bg-lbrown hover:text-white rounded-full px-6 py-1">
                        Написать
                    </button>
                </OpenChat>
            </div>
            <div className="flex">
                <div className="lg:w-2/5 w-1/2 rounded-lg flex items-center justify-center">
                    <BookImages style='w-full h-[420px] rounded-lg object-cover' images={bookData.img}/>
                </div>
                <div className="lg:w-3/5 w-1/2 pl-4">
                    <div className="mb-4 text-xl">
                        <p className="flex gap-3">
                            <span className="font-semibold">Продавец:</span>
                            <span>{bookData.sellerName}</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="font-semibold">Номер телефона:</span>
                            <span>{bookData.phoneNumber}</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="font-semibold">Город:</span>
                            <span>{bookData.city}</span>
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Описание</p>
                        <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">{bookData.description}</div>
                    </div>
                </div>
            </div>
            <div className='flex flex-row justify-between'>
                <div className="mt-4 lg:w-2/5 w-1/2 ml-8 text-lg">
                    <h2 className="text-xl font-semibold">Характеристики</h2>
                    <ul className="list-disc list-inside">
                        <li>Автор: {bookData.author}</li>
                        <li>Год издания: {bookData.publicationYear}</li>
                        <li>Жанр: {bookData.genre}</li>
                        <li>Сумма залога: {bookData.deposit}</li>
                    </ul>
                </div>
                <div className="flex text-lg gap-10 lg:w-3/5 w-1/2 flex-row items-center mt-4">
                    {bookData.interactionType == "sale" ||  bookData.interactionType == "both" 
                    ? <div className='flex flex-col gap-4'>
                        <p className=''>
                            <span className="font-semibold">Стоимость :</span>
                            <span>{Number(bookData.salePrice).toFixed(0)} ₽</span>
                        </p>
                        <button onClick={purchaseBook} className="border w-fit text-xl border-lbrown rounded-full px-7 py-2 cursor-pointer hover:bg-lbrown hover:text-white ">
                            Купить
                        </button>
                    </div>:<></>}
                    {bookData.interactionType == "rent" ||  bookData.interactionType == "both" 
                    ? <div className='flex flex-col gap-4'>
                        <div className='flex gap-2'>
                            <span className="font-semibold">Аренда:</span>
                            <span>{`${(Number(bookData.rentPrice) + Number(bookData.deposit)).toFixed(0)} ₽ (с учетом залога - ${Number(bookData.deposit).toFixed(0)} ₽)`}</span>
                        </div>
                        <button onClick={rentBook} className="border w-fit text-xl border-lbrown rounded-full px-7 py-2 cursor-pointer hover:bg-lbrown hover:text-white ">
                            Арендовать
                        </button>
                    </div>:<></>}
                </div>
            </div>
        </div>
    );
}