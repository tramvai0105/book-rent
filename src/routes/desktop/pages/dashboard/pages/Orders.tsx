import { useState } from "react"
import book from "../../../../../assets/book.jpg"
import { useEffect } from 'react';
import { OrdersData, Purchase, RentalAsLessor, RentalAsRenter, Sale } from "../../../../../utils/dataModels";
import store from "../../../../../utils/store";
import { clsx } from 'clsx';

enum OrdersEnum {
    Buy,
    Sell,
}

export default function Orders() {

    const [page, setPage] = useState<OrdersEnum>(OrdersEnum.Sell);
    const [data, setData] = useState<OrdersData | null>(null)

    useEffect(() => {
        fetchOrders();
    }, [])

    async function fetchOrders() {
        let res = await fetch("/api/private/orders");
        let body: OrdersData = await res.json();
        setData(body);
    }

    return (
        <div className="flex flex-col mb-4 gap-4">
            <div className="flex flex-row gap-6">
                <h1 className="text-2xl font-bold mr-12">Заказы</h1>
                <button onClick={() => setPage(OrdersEnum.Sell)} className={clsx({"underline":page == OrdersEnum.Sell}, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Продажа</button>
                <button onClick={() => setPage(OrdersEnum.Buy)} className={clsx({"underline":page == OrdersEnum.Buy}, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Покупка</button>
            </div>
            {page == OrdersEnum.Buy && data ? <OrdersBuy rf={fetchOrders} sales={data?.purchases} rentals={data?.rentalsAsRenter} /> : <></>}
            {page == OrdersEnum.Sell && data ? <OrdersSell rf={fetchOrders} sales={data?.sales} rentals={data?.rentalsAsLessor} /> : <></>}
        </div>
    )
}

function OrdersBuy({ sales, rentals, rf }: { sales: Purchase[], rentals: RentalAsRenter[], rf: ()=>Promise<void> }) {
    return (
        <div className="flex flex-col gap-4">
            {sales.map((s, i) => <OrderBuySale data={s} key={i} />)}
            {rentals.map((s, i) => <OrderBuyRent rf={rf} data={s} key={i} />)}
        </div>
    )
}

function OrderBuyRent({ data, rf }: { data: RentalAsRenter, rf: ()=>Promise<void> }) {

    async function extendRent(){
        let res = await fetch("/api/b/requestExtend", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({rentalId: data.rentalId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function returnRequest(){
        let res = await fetch("/api/b/requestReturn", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({rentalId: data.rentalId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                    <h2 className="font-bold">{data.price}</h2>
                    <h2>{data.address}</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>{data.lessorName}</span>
                            <button>Chat</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата начала:</span>
                        <span>{new Date(data.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>{data.endDate ? new Date(data.endDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                    </div>
                </div>
                <div className="flex gap-2 flex-col ml-auto mr-4 items-center justify-center">
                    <span>{data.price} ₽</span>
                    {data.status == "active"?<button onClick={extendRent} className="border-dark w-full cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Продлить аренду</button>:<></>}
                    {data.status == "active"?<button onClick={returnRequest} className="border-dark w-full cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Вернул книгу</button>:<></>}
                    {data.status == "pending"?<div className="px-4 py-1 whitespace-nowrap">Ожидает подтверждения</div>:<></>}
                </div>
            </div>
        </div>
    )
}

function OrderBuySale({ data }: { data: Purchase }) {
    return (<div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
        <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
        <div className="w-full flex flex-row">
            <div className="flex flex-col gap-3 w-3/8">
                <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                <h2 className="font-bold">{data.price}</h2>
                <h2>{data.address}</h2>
            </div>
            <div className="flex flex-col gap-3 w-2/4">
                <div className="flex flex-row gap-6">
                    <span className="font-medium">Покупатель</span>
                    <div className="flex flex-row">
                        <span>{data.sellerName}</span>
                        <button>Chat</button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                <span>{data.price} ₽</span>
                <div className="px-4 py-1 whitespace-nowrap">Ожидает подтверждения</div>
            </div>
        </div>
    </div>
    )
}

function OrdersSell({ sales, rentals, rf }: { sales: Sale[], rentals: RentalAsLessor[], rf: ()=>Promise<void> }) {
    return (
        <div className="flex flex-col gap-4">
            {sales.map((s, i) => <OrderSellSale rf={rf} data={s} key={i} />)}
            {rentals.map((s, i) => <OrderSellRent rf={rf} data={s} key={i} />)}
        </div>
    )
}

function OrderSellRent({ data, rf }: { data: RentalAsLessor, rf: ()=>Promise<void> }) {

    async function confirmRent(){
        let res = await fetch("/api/b/confirmRental", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({rentalId: data.rentalId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function confirmExtend(){
        let res = await fetch("/api/b/confirmExtend", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({rentalId: data.rentalId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function confirmReturn(){
        let res = await fetch("/api/b/confirmReturn", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({rentalId: data.rentalId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                    <h2 className="font-bold">{data.price}</h2>
                    <h2>{data.address}</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>{data.renterName}</span>
                            <button>Chat</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата начала:</span>
                        <span>{new Date(data.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>{data.endDate ? new Date(data.endDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                    <span>{data.price} ₽</span>
                    {data.status == "pending"?<button onClick={confirmRent} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить аренду</button>:<></>}
                    {data.status == "returnRequest"?<button onClick={confirmReturn} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить возврат</button>:<></>}
                    {data.status == "extendRequest"?<button onClick={confirmExtend} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить продление</button>:<></>}
                </div>
            </div>
        </div>
    )
}

function OrderSellSale({ data, rf }: { data: Sale, rf: ()=>Promise<void> }) {

    async function confirmSale(){
        let res = await fetch("/api/b/confirmPurchase", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({purchaseId: data.purchaseId})
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    return (<div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
        <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
        <div className="w-full flex flex-row">
            <div className="flex flex-col gap-3 w-3/8">
                <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                <h2 className="font-bold">{data.price}</h2>
                <h2>{data.address}</h2>
            </div>
            <div className="flex flex-col gap-3 w-2/4">
                <div className="flex flex-row gap-6">
                    <span className="font-medium">Покупатель</span>
                    <div className="flex flex-row">
                        <span>{data.buyerName}</span>
                        <button>Chat</button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                <span>{data.price} ₽</span>
                <button onClick={confirmSale} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить продажу</button>
            </div>
        </div>
    </div>
    )
}