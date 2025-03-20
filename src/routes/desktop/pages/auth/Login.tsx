import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from '../../../../utils/store';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                setSuccess('Вход выполнен успешно!');
                setEmail('');
                setPassword('');
                store.fetchUser();
                setTimeout(()=>{
                    navigate("/")
                }, 1500)
            } else {
                throw new Error('Ошибка входа');
            }
        } catch (err) {
            console.log(err)
            setError('Ошибка входа. Проверьте имя пользователя и пароль.');
        }
    };

    return (
        <>
            <h2 className='text-2xl font-bold'>Вход</h2>
            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="email">Почта:</label>
                    <input  className='rounded-md pl-1 bg-white'
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-2'>
                    <label htmlFor="password">Пароль:</label>
                    <input  className='rounded-md pl-1 bg-white'
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className='bg-main border-[1px] mx-auto border-dark px-6 py-2 text-xl w-fit rounded-lg hover:bg-lbrown hover:text-bright' type="submit">Войти</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </>
    );
};

export default Login;