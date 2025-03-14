import React from 'react';

const Logout = () => {
    const handleLogout = async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Здесь вы можете выполнить действия после успешного выхода, например, перенаправить пользователя
                alert('Вы успешно вышли из системы!');
                // Например, перенаправление на главную страницу
                window.location.href = '/'; // Замените на нужный вам путь
            } else {
                throw new Error('Ошибка выхода');
            }
        } catch (err) {
            alert('Ошибка выхода. Попробуйте еще раз.');
        }
    };

    return (
        <button onClick={handleLogout}>
            Выйти
        </button>
    );
};

export default Logout;