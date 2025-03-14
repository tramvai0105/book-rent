import React from 'react'

export default function NewListing() {
    return (
        <form className='flex w-full h-full flex-col gap-2'>
            <div className='w-full h-[1px] bg-dark'></div>
            <h2 className='text-xl font-bold text-lbrown'>Название книги</h2>
            <input placeholder='Введите название книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <h2 className='text-xl font-bold text-lbrown'>Автор</h2>
            <input placeholder='Введите автора книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <h2 className='text-xl font-bold text-lbrown'>Год издания</h2>
            <input placeholder='Введите год издания книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <h2 className='text-xl font-bold text-lbrown'>Жанр</h2>
            <input placeholder='Введите жанр книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <h2 className='text-xl font-bold text-lbrown'>Адресс встречи</h2>
            <input placeholder='Введите адресс встречи...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <h2 className='text-xl font-bold text-lbrown'>Ваш номер телефона</h2>
            <input placeholder='Введите ваш номер телефона...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'></input>
            <div className="flex ml-6 flex-col gap-1">
                <div className='flex flex-row items-center'>
                    <label className='w-1/3 flex flex-row items-center text-xl gap-4 font-bold text-lbrown'>
                        <input type="radio" name="type" value="rent" />
                        Аренда
                    </label>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Стоимость</h2>
                        <input placeholder=''
                            className=' w-[40%] pl-2 h-[35px] bg-main rounded-md'></input>
                    </div>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Сумма залога</h2>
                        <input placeholder=''
                            className=' w-[40%]pl-2 h-[35px] bg-main rounded-md'></input>
                    </div>
                </div>
                <div className='flex flex-row items-center'>
                    <label className='w-1/3 flex flex-row items-center gap-4 text-xl font-bold text-lbrown'>
                        <input type="radio" name="type" value="sell" />
                        Продажа
                    </label>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Стоимость</h2>
                        <input placeholder=''
                            className='pl-2 w-[40%] h-[35px] bg-main rounded-md'></input>
                    </div>
                </div>
            </div>
            <h2 className='text-xl font-bold text-lbrown'>Описание</h2>
            <textarea placeholder='Текст описания...'
                className='w-full pl-2 h-[200px] bg-main rounded-md'></textarea>
        </form>
    )
}
