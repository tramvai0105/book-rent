import book from "../../../../../assets/book.jpg"

import React from 'react'

export default function () {
    return (
        <div className='flex flex-col text-xl w-full rounded-2xl gap-6 px-6 py-12 border-dark border-[1px]'>
            <h1 className='text-2xl font-bold'>Настройки</h1>
            <div className="w-full flex flex-row">
                <div className='w-1/2'>
                    <div className='flex flex-col gap-4 w-fit'>
                        <img src={book} className="w-[270px] h-[320px] object-cover rounded-md" />
                        <button className="cursor-pointer px-8 py-2 rounded-xl bg-lbrown text-xl 
                border-[1px] border-lbrown hover:text-white">Изменить аватар</button>
                    </div>
                </div>
                <div className='flex flex-col gap-4 w-1/2'>
                    <span>Текущее имя: asd@gmail.com</span>
                    <span>Новое имя:</span>
                    <input placeholder="Введите новое имя" className="w-[70%] border-dark border-[1px] pl-1 rounded-xl bg-white" />
                    <button className="cursor-pointer px-8 py-2 rounded-xl bg-lbrown text-xl 
                border-[1px] border-lbrown hover:text-white w-fit">Сохранить</button>
                </div>
            </div>
        </div>
    )
}
