import React, { useEffect, useState } from 'react'
import { DisputeData } from './DisputesPage';
import { useNavigate, useParams } from 'react-router-dom';
import store from '../../../../../utils/store';

interface ChatMessageI {
    id: number;
    senderId: number;
    receiverId: number;
    message: string;
    createdAt: string;
    role: 'Арендодатель' | 'Арендатор';
}

export default function DisputePage() {

    const [dispute, setDispute] = useState<DisputeData | null>(null)
    const [messages, setMessages] = useState<ChatMessageI[]>([])
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDispute();
    }, [])

    useEffect(() => {
        fetchMessages();
    }, [dispute])

    async function fetchDispute() {
        let res = await fetch(`/api/m/dispute/${id}`);
        if(!res.ok){
            setDispute(null);
            return;
        }
        let body: DisputeData = await res.json();
        setDispute(body);
    }

    async function fetchMessages() {
        if (!dispute) {
            return
        }
        let res = await fetch(`/api/m/chat/${dispute.chatId}`);
        if(!res.ok){
            setMessages([])
            return;
        }
        let body: ChatMessageI[] = await res.json();
        setMessages(body);
    }

    async function transferDepositToSeller(){
        if (!dispute) {
            return
        }
        let res = await fetch("/api/m/transferDepositToSeller", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ disputeId: dispute.id }),
        });
        let body = await res.json();
        alert(body.message);
        store.fetchUser()
        navigate("/dashboard/mod")
    }

    async function returnDepositToRenter(){
        if (!dispute) {
            return
        }
        let res = await fetch("/api/m/returnDepositToRenter", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ disputeId: dispute.id }),
        });
        let body = await res.json();
        alert(body.message);
        store.fetchUser()
        navigate("/dashboard/mod")
    }

    if (dispute == null) {
        return(<div>...Загрузка</div>)
    }

    if (dispute) return (
        <div className='flex flex-col text-lg gap-4'>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Название:</span>
                <span>{dispute.title}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Автор:</span>
                <span>{dispute.author}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Цена аренды:</span>
                <span>{dispute.rentPricePerMonth}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Залог:</span>
                <span>{dispute.deposit}</span>
            </div>
            <span className='text-xl font-bold'>Детали аренды</span>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Арендатор:</span>
                <span>{dispute.renterEmail}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Арендодатель:</span>
                <span>{dispute.sellerEmail}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Дата начала аренды:</span>
                <span>{new Date(dispute.startDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Дата окончания аренды:</span>
                <span>{new Date(dispute.endDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className='flex flex-row gap-2'>
                <span className='font-bold'>Описание проблемы:</span>
                <span>{dispute.description}</span>
            </div>
            <div className='flex flex-col gap-2'>
                <span className='font-bold'>Фото доказательств:</span>
                <div className='flex flex-row gap-2'>
                    {dispute.images.map((img, i) => <img className='w-[200px] h-[200px] object-cover' key={i} src={`/files/${img}`} />)}
                </div>
            </div>
            <span className='text-xl font-bold'>Чат</span>
            <div className='flex flex-col p-4 border-[1px] border-gray-400 bg-gray-100 rounded-md'>
                {messages.map((m, i) => {
                    return (<div className='flex flex-row gap-2'>
                        <span>{m.role} :</span>
                        <span>{m.message}</span>
                    </div>)
                })}
            </div>
            <div className='flex flex-row gap-2'>
                <button onClick={transferDepositToSeller} className='px-6 py-1 bg-green-400 border-[1px] hover:text-white rounded-md'>Перевести залог арендодателю</button>
                <button onClick={returnDepositToRenter} className='px-6 py-1 bg-red-400 border-[1px] hover:text-white rounded-md'>Вернуть залог арендатору</button>
            </div>
        </div>
    )
}
