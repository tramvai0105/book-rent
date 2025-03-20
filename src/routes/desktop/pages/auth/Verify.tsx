import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from '../../../../utils/store';

function Verify() {
    const [email, setEmail] = useState(store.getUserData()?.email || "");
    const [confirmationCode, setConfirmationCode] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const response = await fetch('/auth/verificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmationCode }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Верификация прошла успешно!');
                setConfirmationCode('');
                store.fetchUser();
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                throw new Error(data.message || 'Ошибка верификации');
            }
        } catch (err) {
            console.log(err);
            alert('Ошибка верификации. Проверьте адрес электронной почты и код.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[65vh] w-full h-full">
            <div className="flex text-lg gap-5 items-center rounded-xl flex-col px-14 py-24 bg-bright border-[1px] border-main">
                <h2 className='text-2xl font-bold'>Верификация</h2>
                <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                    <div className='flex flex-row justify-between gap-2'>
                        <label htmlFor="email">Почта:</label>
                        <input
                            className='rounded-md pl-1 bg-white'
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='flex flex-row justify-between gap-2'>
                        <label htmlFor="confirmationCode">Код подтверждения:</label>
                        <input
                            className='rounded-md pl-1 bg-white'
                            type="text"
                            id="confirmationCode"
                            value={confirmationCode}
                            onChange={(e) => setConfirmationCode(e.target.value)}
                            required
                        />
                    </div>
                    <button className='bg-main border-[1px] mx-auto border-dark px-6 py-2 text-xl w-fit rounded-lg hover:bg-lbrown hover:text-bright' type="submit">Подтвердить</button>
                </form>
            </div>
        </div>
    );
};

export default Verify;