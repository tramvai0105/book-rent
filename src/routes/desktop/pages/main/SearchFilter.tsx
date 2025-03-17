
export default function SearchFilter() {
    return (
        <form className="w-[320px] drop-shadow-lg rounded-md 
    h-fit bg-main flex flex-col text-xl py-4 pb-8 gap-3 px-2">
            <div className="w-full gap-3 items-center flex flex-col">
                <h1 className="text-2xl">Фильтры</h1>
                <input placeholder="Город" className="w-[70%] pl-1 rounded-xl bg-white" />
            </div>
            <div className="flex flex-col gap-2 w-full items-center">
                <h2>Цена, ₽</h2>
                <div className="flex text-lg justify-center flex-row gap-4">
                    <input placeholder="От" className="w-[42%] pl-1 bg-white rounded-md" />
                    <input placeholder="До" className="w-[42%] pl-1 bg-white rounded-md" />
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full items-center">
                <h2>Год издания</h2>
                <div className="flex text-lg justify-center flex-row gap-4">
                    <input placeholder="От" className="w-[42%] pl-1 bg-white rounded-md" />
                    <input placeholder="До" className="w-[42%] pl-1 bg-white rounded-md" />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div className="w-full justify-center flex">Тип услуги</div>
                <div className="flex ml-6 flex-col gap-1">
                    <label>
                        <input type="radio" name="type" value="rent" />
                        Аренда
                    </label>
                    <label>
                        <input type="radio" name="type" value="sell" />
                        Продажа
                    </label>
                </div>
            </div>
        </form>)
}