import React from 'react';
import icon from "../../../assets/message.svg";
import { useNavigate } from 'react-router-dom';

interface OpenChatProps {
    children: React.ReactNode;
    listingId: number;
}

export default function OpenChat({ children, listingId }: OpenChatProps) {
    const hasValidChildren = React.Children.toArray(children).every(child =>
        React.isValidElement(child)
    );

    const navigate = useNavigate();

    async function chat() {
        try {
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
            navigate("/chat");
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    return (
        <div>
            {hasValidChildren ? (
                <div onClick={chat}>{children}</div>
            ) : (
                <img onClick={chat} src={icon} alt="Open chat" />
            )}
        </div>
    );
}