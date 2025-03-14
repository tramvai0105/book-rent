import book from "../../../../../assets/book.jpg"

export default function Orders() {
    return (
        <div className="flex flex-col mb-4 gap-4">
            <div className="flex flex-row gap-6">
                <h1 className="text-2xl font-bold mr-12">Заказы</h1>
                <button className="cursor-pointer text-xl rounded-md underline hover:bg-dark hover:text-white px-6 py-1">Продажа</button>
                <button className="cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1">Покупка</button>
            </div>
            <OrdersSell />
        </div>
    )
}

function OrdersBuy() {
    return (
        <div className="flex flex-col gap-4">
            <OrderBuy />
            <OrderBuy />
            <OrderBuy />
        </div>
    )
}

function OrderBuy() {
    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={book} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">Название</h2>
                    <h2 className="font-bold">Цена</h2>
                    <h2>Город</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>123123123123123123123</span>
                            <button>Chat</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата начала:</span>
                        <span>123123123</span>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>123123123</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                    <span>1234 ₽</span>
                    <button className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить аренду</button>
                </div>
            </div>
        </div>
    )
}

function OrdersSell() {
    return (
        <div className="flex flex-col gap-4">
            <OrderSell />
            <OrderSell />
            <OrderSell />
        </div>
    )
}

function OrderSell() {
    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={book} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">Название</h2>
                    <h2 className="font-bold">Цена</h2>
                    <h2>Город</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>123123123123123123123</span>
                            <button>Chat</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата начала:</span>
                        <span>123123123</span>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>123123123</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto mr-4 items-center justify-center">
                    <span>1234 ₽</span>
                    <button className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить аренду</button>
                </div>
            </div>
        </div>
    )
}