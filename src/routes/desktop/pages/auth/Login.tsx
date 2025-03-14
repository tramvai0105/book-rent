import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                // Здесь вы можете перенаправить пользователя на другую страницу или выполнить другие действия
            } else {
                throw new Error('Ошибка входа');
            }
        } catch (err) {
            console.log(err)
            setError('Ошибка входа. Проверьте имя пользователя и пароль.');
        }
    };

    return (
        <div>
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Почта:</label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Войти</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default Login;