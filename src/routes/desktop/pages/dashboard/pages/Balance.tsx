
import React from 'react'

export default function () {
  return (
    <div className='flex flex-col text-xl w-fit rounded-2xl gap-6 px-6 py-12 border-dark border-[1px]'>
        <div className='text-2xl font-bold'>Баланс</div>
        <div className='flex flex-row gap-4'>
            <span>Активный баланс</span>
            <span>1000 ₽</span>
        </div>
        <div className='flex flex-row gap-4'>
            <span>Замороженный баланс</span>
            <span>1000 ₽</span>
        </div>
        <div className='flex flex-row gap-4'>
            <span>Выведенный баланс</span>
            <span>1000 ₽</span>
        </div>
        <div className='flex flex-row gap-4'>
            <button className='cursor-pointer border-[1px] border-dark px-6 py-1 rounded-md bg-lbrown hover:bg-brown hover:text-white'>Пополнить баланс</button>
            <button className='cursor-pointer border-[1px] border-dark px-6 py-1 rounded-md bg-lbrown hover:bg-brown hover:text-white'>Вывести баланс</button>
        </div>
    </div>
  )
}
