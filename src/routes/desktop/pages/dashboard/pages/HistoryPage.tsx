import { useEffect, useState } from "react";
import { OrdersData, Purchase, RentalAsLessor, RentalAsRenter, Sale } from "../../../../../utils/dataModels";
import clsx from "clsx";

enum HistoryEnum {
    Buy,
    Sell,
}

export default function HistoryPage() {
    const [page, setPage] = useState<HistoryEnum>(HistoryEnum.Buy);
    const [history, setHistory] = useState<OrdersData | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        let res = await fetch("/api/private/history");
        let body = await res.json();
        setHistory(body);
    }

    return (
        <div className="flex flex-col mb-4 gap-4">
            <div className="flex flex-row gap-6">
                <h1 className="text-2xl font-bold mr-12">История</h1>
                <button onClick={() => setPage(HistoryEnum.Buy)} className={clsx({ "underline": page === HistoryEnum.Buy }, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Покупка</button>
                <button onClick={() => setPage(HistoryEnum.Sell)} className={clsx({ "underline": page === HistoryEnum.Sell }, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Продажа</button>
            </div>
            {page == HistoryEnum.Buy && history ? <HistoryBuy sales={history?.purchases} rentals={history?.rentalsAsRenter} /> : <></>}
            {page == HistoryEnum.Sell && history ? <HistorySell sales={history?.sales} rentals={history?.rentalsAsLessor} /> : <></>}
        </div>
    );
}

function HistoryBuy({ sales, rentals }: { sales: Purchase[], rentals: RentalAsRenter[] }) {
    return (
        <div className="flex flex-col gap-4">
            {sales.map((s, i) => <HistoryBuySale data={s} key={i} />)}
            {rentals.map((s, i) => <HistoryBuyRent data={s} key={i} />)}
        </div>
    )
}

function HistoryBuyRent({ data }: { data: RentalAsRenter }) {

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
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>{data.endDate ? new Date(data.endDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                    </div>
                </div>
                <div className="flex gap-2 flex-col ml-auto mr-4 items-center justify-center">
                    <span>{data.price} ₽</span>
                </div>
            </div>
        </div>
    )
}

function HistoryBuySale({ data }: { data: Purchase }) {
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
                <div className="flex flex-row gap-6">
                    <span className="font-medium">Дата покупки:</span>
                    <span>{data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                </div>
            </div>
            <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                <span>{data.price} ₽</span>
            </div>
        </div>
    </div>
    )
}

function HistorySell({ sales, rentals }: { sales: Sale[], rentals: RentalAsLessor[] }) {
    return (
        <div className="flex flex-col gap-4">
            {sales.map((s, i) => <HistorySellSale data={s} key={i} />)}
            {rentals.map((s, i) => <HistorySellRent data={s} key={i} />)}
        </div>
    )
}

function HistorySellRent({ data }: { data: RentalAsLessor }) {

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
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>{data.endDate ? new Date(data.endDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                    <span>{data.price} ₽</span>
                </div>
            </div>
        </div>
    )
}

function HistorySellSale({ data }: { data: Sale }) {

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
                    </div>
                </div>
                <div className="flex flex-row gap-6">
                    <span className="font-medium">Дата продажи:</span>
                    <span>{data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString('ru-RU') : "Появится после подтверждения сделки"}</span>
                </div>
            </div>
            <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                <span>{data.price} ₽</span>
            </div>
        </div>
    </div>
    )
}