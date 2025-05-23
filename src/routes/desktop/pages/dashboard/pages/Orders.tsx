import { useState } from "react"
import { useEffect } from 'react';
import { OrdersData, Purchase, RentalAsLessor, RentalAsRenter, Sale } from "../../../../../utils/dataModels";
import store from "../../../../../utils/store";
import { clsx } from 'clsx';
import OpenChat from "../../../ui/OpenChat";
import refresh from "../../../../../assets/refresh.svg"

enum OrdersEnum {
    Buy,
    Sell,
}

export default function Orders() {

    const [page, setPage] = useState<OrdersEnum>(OrdersEnum.Sell);
    const [data, setData] = useState<OrdersData | null>(null)
    const [fOptionType, setFOptionType] = useState<"" | "rent" | "sale">("")

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
            <div className="flex flex-row gap-6 items-center">
                <h1 className="text-2xl font-bold">Заказы</h1>
                <select onChange={e=>{setFOptionType(e.target.value)}}>
                    <option value={""}>Оба способа</option>
                    <option value={"rent"}>Аренда</option>
                    <option value={"sale"}>Продажа</option>
                </select>
                <img onClick={fetchOrders} className="h-[25px] w-[25px] cursor-pointer hover:rotate-180 transition-transform duration-300 mr-12" src={refresh}/>
                <button onClick={() => setPage(OrdersEnum.Sell)} className={clsx({ "underline": page == OrdersEnum.Sell }, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Продажа</button>
                <button onClick={() => setPage(OrdersEnum.Buy)} className={clsx({ "underline": page == OrdersEnum.Buy }, "cursor-pointer text-xl rounded-md hover:bg-dark hover:text-white px-6 py-1")}>Покупка</button>
            </div>
            {page == OrdersEnum.Buy && data ? <OrdersBuy type={fOptionType} rf={fetchOrders} sales={data?.purchases} rentals={data?.rentalsAsRenter} /> : <></>}
            {page == OrdersEnum.Sell && data ? <OrdersSell type={fOptionType} rf={fetchOrders} sales={data?.sales} rentals={data?.rentalsAsLessor} /> : <></>}
        </div>
    )
}

function OrdersBuy({ sales, rentals, rf, type }: { sales: Purchase[], rentals: RentalAsRenter[], rf: () => Promise<void>, type: "rent" | "sale" | "" }) {
    return (
        <div className="flex flex-col gap-4">
            {type == "rent" ? <></> : sales.map((s, i) => <OrderBuySale data={s} key={i} />)}
            {type == "sale" ? <></> : rentals.map((s, i) => <OrderBuyRent rf={rf} data={s} key={i} />)}
        </div>
    )
}

function OrderBuyRent({ data, rf }: { data: RentalAsRenter, rf: () => Promise<void> }) {

    async function extendRent() {
        let res = await fetch("/api/b/requestExtend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId: data.rentalId })
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function returnRequest() {
        let res = await fetch("/api/b/requestReturn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId: data.rentalId })
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row items-center">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                    <h2 className="font-bold">{data.price}</h2>
                    <h2>{data.address}</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row items-center gap-2">
                            <span>{data.lessorName}</span>
                            <OpenChat listingId={data.listingId} />
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
                    {data.status == "active" ? <button onClick={extendRent} className="border-dark w-full cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Продлить аренду</button> : <></>}
                    {data.status == "active" ? <button onClick={returnRequest} className="border-dark w-full cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Вернул книгу</button> : <></>}
                    {data.status == "pending" ? <div className="px-4 py-1 whitespace-nowrap">Ожидает подтверждения</div> : <></>}
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
                    <div className="flex flex-row items-center gap-2">
                        <span>{data.sellerName}</span>
                        <OpenChat listingId={data.listingId} />
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

function OrdersSell({ sales, rentals, rf, type }: { sales: Sale[], rentals: RentalAsLessor[], rf: () => Promise<void>, type: "rent" | "sale" | "" }) {
    return (
        <div className="flex flex-col gap-4">
            {type == "rent" ? <></> : sales.map((s, i) => <OrderSellSale rf={rf} data={s} key={i} />)}
            {type == "sale" ? <></> : rentals.map((s, i) => <OrderSellRent rf={rf} data={s} key={i} />)}
        </div>
    )
}

function OrderSellRent({ data, rf }: { data: RentalAsLessor, rf: () => Promise<void> }) {

    const [disputeModal, setDisputeModal] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        rentalId: data.rentalId,
        description: '',
        photos: null,
    });

    async function confirmRent() {
        let res = await fetch("/api/b/confirmRental", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId: data.rentalId })
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function confirmExtend() {
        let res = await fetch("/api/b/confirmExtend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId: data.rentalId })
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    async function confirmReturn() {
        let res = await fetch("/api/b/confirmReturn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId: data.rentalId })
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        rf()
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photos') {
            setFormData({
                ...formData,
                photos: files,
            });

            const imagesArray = Array.from(files).map(file => URL.createObjectURL(file));
            setPreviewImages(imagesArray);
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    async function createDispute(e) {
        e.preventDefault();
        const data = new FormData();

        for (const key in formData) {
            if (key === 'photos') {
                for (let i = 0; i < formData.photos.length; i++) {
                    data.append('photos', formData.photos[i]);
                }
            } else {
                data.append(key, formData[key]);
            }
        }
        let res = await fetch("/api/b/createDispute", {
            method: "POST",
            body: data
        })
        let body = await res.json();
        store.fetchUser()
        alert(body.message);
        setDisputeModal(false);
        rf()
    }

    function openModal(){
        setFormData({
            rentalId: data.rentalId,
            description: '',
            photos: null,
        })
        setPreviewImages([])
        setDisputeModal(true);
    }

    function closeModal(){
        const close = confirm("Точно закрыть окно? Данные не сохранятся")
        if(!close){
            return
        }
        setFormData({
            rentalId: data.rentalId,
            description: '',
            photos: null,
        })
        setPreviewImages([])
        setDisputeModal(false);
    }

    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            {disputeModal
                ?
                <div onClick={closeModal} className="absolute cursor-pointer flex items-center justify-center bg-black/50 top-0 bottom-0 left-0 right-0">
                    <form onSubmit={createDispute} onClick={(e) => { e.stopPropagation() }} 
                    className="bg-white w-[60%] gap-4 flex flex-col p-10 cursor-default">
                        <h2 className='text-xl font-bold text-lbrown'>Загрузите изображения(минимум одно)</h2>
                        <input
                            type='file'
                            name='photos'
                            onChange={handleChange}
                            multiple
                            className='w-full pl-2 h-[45px] bg-main rounded-md'
                        />
                        <div className="flex flex-wrap gap-2">
                            {previewImages.map((image, index) => (
                                <img key={index} src={image} alt={`preview-${index}`} className="w-24 h-24 object-cover rounded-md" />
                            ))}
                        </div>
                        <textarea
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            placeholder='Опишите проблему...'
                            className='w-full resize-none pl-2 h-[200px] bg-main rounded-md'
                            required
                        />
                        <button type="submit" className="px-4 py-1 mx-auto rounded-md border-red-400 hover:bg-red-400 border-[2px] w-fit">Отправить</button>
                    </form>
                </div>
                : <></>}
            <img src={`/${JSON.parse(data.img)[0]}`} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                    <h2 className="font-bold">{data.price}</h2>
                    <h2>{data.address}</h2>
                </div>
                <div className="flex flex-col justify-center gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row items-center gap-2">
                            <span>{data.renterName}</span>
                            <OpenChat listingId={data.listingId} />
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
                <div className="flex flex-col ml-auto gap-2 mr-4 items-center justify-center">
                    <span>{data.price} ₽</span>
                    {data.status == "pending" ? <button onClick={confirmRent} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить аренду</button> : <></>}
                    {data.status == "returnRequest" ? <button onClick={confirmReturn} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить возврат</button> : <></>}
                    {data.status == "returnRequest" ? <button onClick={openModal} className="border-dark bg-red-400 w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Сообщить о проблеме</button> : <></>}
                    {data.status == "extendRequest" ? <button onClick={confirmExtend} className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить продление</button> : <></>}
                </div>
            </div>
        </div>
    )
}

function OrderSellSale({ data, rf }: { data: Sale, rf: () => Promise<void> }) {

    async function confirmSale() {
        let res = await fetch("/api/b/confirmPurchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchaseId: data.purchaseId })
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
                    <div className="flex flex-row items-center gap-2">
                        <span>{data.buyerName}</span>
                        <OpenChat listingId={data.listingId} />
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