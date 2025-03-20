import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, city, contactInfo }),
            });

            if (response.ok) {
                alert('Регистрация прошла успешно! Теперь вы можете войти. Вам отправлен код подтверждения на почту.');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setCity('');
                setContactInfo('');
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка регистрации. Попробуйте еще раз.');
            }
        } catch (err) {
            alert('Ошибка регистрации. Попробуйте еще раз.');
        }
    };

    return (
        <>
            <h2 className='text-2xl font-bold'>Регистрация</h2>
            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="email">Почта:</label>
                    <input className='rounded-md h-[30px] pl-1 bg-white'
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="password">Пароль:</label>
                    <input  className='rounded-md h-[30px] pl-1 bg-white'
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-2'>
                    <label className='whitespace-pre-wrap' htmlFor="confirmPassword">{`Подтверждение 
пароля:`}</label>
                    <input  className='rounded-md h-[30px] pl-1 bg-white'
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="city">Город:</label>
                    <input  className='rounded-md h-[30px] pl-1 bg-white'
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="phone">Телефон:</label>
                    <input  className='rounded-md h-[30px] pl-1 bg-white'
                        type="tel"
                        id="phone"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                    />
                </div>
                <button className='bg-main border-[1px] mx-auto border-dark px-6 py-2 text-xl w-fit rounded-lg hover:bg-lbrown hover:text-bright'  type="submit">Зарегистрироваться</button>
            </form>
        </>
    );
};

export default Registration;