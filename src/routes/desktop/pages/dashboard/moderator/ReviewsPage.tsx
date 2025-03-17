import React from 'react'
import book from "../../../../../assets/book.jpg"

export default function ReviewsPage() {
    return (
        <div className='flex flex-col gap-4'>
            <h1 className="text-2xl font-bold">Объявления</h1>
            <Review />
            <Review />
            <Review />
        </div>
    )
}

function Review() {
    return (
        <div className="bg-bright p-4 rounded-lg shadow-lg mt-4">
            <div className="flex w-full justify-between items-center mb-4">
                <h1 className="text-2xl text-lbrown font-medium text-brown-600">
                    Мэри Шэлли - Франкенштейн
                </h1>
                <button className="border border-lbrown text-lg cursor-pointer hover:bg-lbrown hover:text-white rounded-full px-6 py-1">
                    Написать
                </button>
            </div>
            <div className="flex">
                <div className="w-1/3 rounded-lg flex items-center justify-center">
                    <img alt="Фотография" className="w-[420px] h-[420px] rounded-lg object-cover" height="150" src={book} width="150" />
                </div>
                <div className="w-2/3 pl-4">
                    <div className="mb-4 text-xl">
                        <p className="flex gap-3">
                            <span className="font-semibold">Продавец:</span>
                            <span>Ваня Петро</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="font-semibold">Номер телефона:</span>
                            <span>+79999999999</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="font-semibold">Город:</span>
                            <span>г. Москва, ул. Петровская, д. 1</span>
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Описание</p>
                        <div className="w-full whitespace-pre-wrap resize-none p-2 rounded-lg">Текст описания</div>
                    </div>
                </div>
            </div>
            <div className='flex flex-row justify-between'>
                <div className="mt-4 w-1/3 ml-8 text-lg">
                    <h2 className="text-xl font-semibold">Характеристики</h2>
                    <ul className="list-disc list-inside">
                        <li>Автор</li>
                        <li>Год издания</li>
                        <li>Жанр</li>
                        <li>Сумма залога</li>
                    </ul>
                </div>
                <div className="flex text-lg gap-10 w-2/3 flex-row items-center mt-4">
                    <div className='flex flex-col gap-4 ml-auto items-center'>
                        <p className=''>
                            <span className="font-semibold mr-2">Стоимость:</span>
                            <span>1000</span>
                        </p>
                        <button className="border text-xl border-dark bg-green-400 rounded-full px-7 py-2 cursor-pointer hover:bg-green-700 hover:text-white ">
                            Опубликовать
                        </button>
                    </div>
                    <div className='flex flex-col gap-4 mr-8 items-center'>
                        <p className=''>
                            <span className="font-semibold mr-2">Аренда:</span>
                            <span>200+залог</span>
                        </p>
                        <button className="border text-xl border-dark bg-red-400 rounded-full px-7 py-2 cursor-pointer hover:bg-red-700 hover:text-white ">
                            Отклонить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
