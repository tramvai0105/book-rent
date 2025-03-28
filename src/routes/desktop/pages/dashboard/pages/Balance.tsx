
import React, { useEffect, useState } from 'react'

interface BalanceI {
    balance: number,
    frozenBalance: number,
    withdrawnBalance: number
}

export default function () {

    const [balance, setBalance] = useState<BalanceI>({
        balance: 0,
        frozenBalance: 0,
        withdrawnBalance: 0
    })

    useEffect(() => {
        fetchBalance();
    }, [])

    async function fetchBalance() {
        let res = await fetch("/api/private/balance");
        let body: BalanceI = await res.json();
        setBalance(body);
    }

    async function addBalance() {
        let amount = prompt("Введите количество для пополнения");
        if (!amount) {
            return;
        }
        let res = await fetch("/balance/add", {
            method: "POST"
            , headers: { "Content-Type": "application/json" }
            , body: JSON.stringify({ amount: amount })
        })
        let body = await res.json();
        alert(body);
    }

    return (
        <div className='flex flex-col text-xl w-fit rounded-2xl gap-6 px-6 py-12 border-dark border-[1px]'>
            <div className='text-2xl font-bold'>Баланс</div>
            <div className='flex flex-row gap-4'>
                <span>Активный баланс</span>
                <span>{balance.balance} ₽</span>
            </div>
            <div className='flex flex-row gap-4'>
                <span>Замороженный баланс</span>
                <span>{balance.frozenBalance} ₽</span>
            </div>
            <div className='flex flex-row gap-4'>
                <span>Выведенный баланс</span>
                <span>{balance.withdrawnBalance} ₽</span>
            </div>
            <div className='flex flex-row gap-4'>
                <button onClick={addBalance} className='cursor-pointer border-[1px] border-dark px-6 py-1 rounded-md bg-lbrown hover:bg-brown hover:text-white'>Пополнить баланс</button>
                <button className='cursor-pointer border-[1px] border-dark px-6 py-1 rounded-md bg-lbrown hover:bg-brown hover:text-white'>Вывести баланс</button>
            </div>
        </div>
    )
}
