import React from 'react';
import icon from "../../../assets/message.svg";
import { useNavigate } from 'react-router-dom';
import store from '../../../utils/store';

interface OpenChatProps {
    children?: React.ReactNode;
    listingId: number;
}

export default function OpenChat({ children, listingId }: OpenChatProps) {
    const hasValidChildren = React.Children.toArray(children).every(child =>
        React.isValidElement(child)
    );

    const navigate = useNavigate();

    const handleNavigate = (id: number) => {
        if (id) {
            navigate({
                pathname: '/chat',
                search: `?id=${id}`,
            });
        }
    };

    async function chat() {
        try {
            if(!store.getUserData()){
                alert("Авторизируйтесь для доступа к чату")
                return;
            }
            const response = await fetch('/api/private/createChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listingId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при создании чата');
            }

            const data = await response.json();
            console.log('Чат успешно создан:', data);
            handleNavigate(listingId);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    return (
        <div>
            {children && hasValidChildren ? (
                <div onClick={chat}>{children}</div>
            ) : (
                <img className='w-[25px] hover:invert h-[25px] cursor-pointer' title='Открыть чат' onClick={chat} src={icon} alt="Open chat" />
            )}
        </div>
    );
}