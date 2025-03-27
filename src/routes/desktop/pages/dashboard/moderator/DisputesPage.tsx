import React, { useEffect, useState } from 'react'
import OpenChat from '../../../ui/OpenChat';
import { useNavigate } from 'react-router-dom';

export interface DisputeData {
    id: number;
    rentalId: number;
    moderatorId: number;
    description: string;
    chatId: number;
    images: string[];
    bookImages: string[];
    status: 'pending' | 'resolved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    renterId: number;
    title: string;
    author: string;
    rentPricePerMonth: number;
    deposit: number;
    startDate: Date;
    endDate: Date;
    renterName: string;
    renterEmail: string;
    sellerName: string;
    sellerEmail: string;
    address: string,
}

export default function DisputesPage() {

    const [disputes, setDisputes] = useState<DisputeData[]>([])

    useEffect(() => {
        fetchOrders();
    }, [])

    async function fetchOrders() {
        let res = await fetch("/api/m/disputes");
        let body: DisputeData[] = await res.json();
        console.log(body)
        setDisputes(body);
    }

    return (
        <div className='flex flex-col gap-4'>
            <h1 className="text-2xl font-bold">Споры</h1>
            {disputes.map((d, i) => <Dispute key={i} data={d} />)}
        </div>
    )
}

function Dispute({ data }: { data: DisputeData }) {

    const navigate = useNavigate();

    return (
        <div className="flex bg-bright rounded-xl gap-4 text-lg flex-row items-center px-4 py-2">
            <img src={`/${data.bookImages[0]}`} className="w-[160px] rounded-md" />
            <div className="w-full flex flex-row">
                <div className="flex flex-col gap-3 w-3/8">
                    <h2 className="text-lbrown font-bold whitespace-pre-wrap">{data.author} - {data.title}</h2>
                    <h2 className="font-bold">{Number(data.rentPricePerMonth).toFixed(0)} ₽</h2>
                    <h2>{data.address}</h2>
                </div>
                <div className="flex flex-col gap-3 w-2/4">
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендодатель</span>
                        <div className="flex flex-row">
                            <span>{data.sellerEmail}</span>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Арендатор</span>
                        <div className="flex flex-row">
                            <span>{data.renterEmail}</span>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6">
                        <span className="font-medium">Дата окончания аренды:</span>
                        <span>{new Date(data.endDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                </div>
                <div className="flex flex-col ml-auto gap-2 mr-4 items-center justify-center">
                    {data.status === "pending" ?<span className='font-bold texl-lg'>{(Number(data.rentPricePerMonth) + Number(data.deposit)).toFixed(0)} ₽</span>:<></>}
                    {data.status === "pending" ? <button onClick={()=>navigate(`./${data.id}`)} className='px-6 py-1 bg-lbrown rounded-md text-xl border-dark hover:bg-main border-[1px]'>Подробнее</button> : <></>}
                    {/* <button className="border-dark w-fit cursor-pointer rounded-md border-[1px] hover:bg-dark hover:text-white px-4 py-1">Подтвердить аренду</button> */}
                    {data.status === "resolved" ? <div className='px-6 py-1 bg-green-400 rounded-md text-xl border-green-600 border-[1px]'>Решён</div> : <></>}
                </div>
            </div>
        </div>
    )
}

