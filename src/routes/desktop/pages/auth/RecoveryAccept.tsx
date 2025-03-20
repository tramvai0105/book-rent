import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecoveryAccept: React.FC = () => {
    const [email, setEmail] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/auth/retriveAccept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, recoveryCode, newPassword }),
            });

            if (response.ok) {
                alert('Пароль успешно изменен!');
                setEmail('');
                setRecoveryCode('');
                setNewPassword('');
                setTimeout(() => {
                    navigate('/'); // Перенаправление на главную страницу или другую
                }, 1500);
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка. Проверьте введенные данные.');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка. Проверьте введенные данные.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[65vh] w-full h-full">
            <div className="flex text-lg gap-5 items-center rounded-xl flex-col px-14 py-24 bg-bright border-[1px] border-main">
                <h2 className='text-2xl font-bold'>Подтверждение кода восстановления</h2>
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
                        <label htmlFor="recoveryCode">Код восстановления:</label>
                        <input
                            className='rounded-md pl-1 bg-white'
                            type="text"
                            id="recoveryCode"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            required
                        />
                    </div>
                    <div className='flex flex-row justify-between gap-2'>
                        <label htmlFor="newPassword">Новый пароль:</label>
                        <input
                            className='rounded-md pl-1 bg-white'
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className='bg-main border-[1px] mx-auto border-dark px-6 py-2 text-xl w-fit rounded-lg hover:bg-lbrown hover:text-bright' type="submit">Подтвердить код</button>
                </form>
            </div>
        </div>
    );
};

export default RecoveryAccept;