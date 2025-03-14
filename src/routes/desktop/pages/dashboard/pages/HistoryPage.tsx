import book from "../../../../../assets/book.jpg"

export default function HistoryPage() {
    return (
        <div className="flex flex-col mb-4 gap-4">
            <div className="flex flex-row gap-6">
                <h1 className="text-2xl font-bold mr-12">История</h1>
            </div>
            <HistoryRecord />
        </div>
    )
}

function HistoryRecord() {
    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={book} className="w-[160px] object-cover rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-medium whitespace-pre-wrap">Название</h2>
                    <h2 className="font-bold">Цена</h2>
                    <h2>Город</h2>
                </div>
                <div className="flex flex-col gap-3 w-3/8">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>123123123123123123123</span>
                            <button>Chat</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>123123123</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto mr-2 items-center justify-center">
                    <span className="text-2xl px-4 py-1 border-gray border-[1px] rounded-xl">1234 ₽</span>
                </div>
            </div>
        </div>
    )
}