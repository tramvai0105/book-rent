import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecoverySend: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/auth/retriveSend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert('Код восстановления отправлен на вашу почту!');
                setEmail('');
                setTimeout(() => {
                    navigate('/recoveryAccept');
                }, 1500);
            } else {
                alert('Ошибка отправки кода восстановления');
            }
        } catch (err) {
            console.log(err);
            alert('Ошибка отправки. Проверьте адрес электронной почты.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[65vh] w-full h-full">
            <div className="flex text-lg gap-5 items-center rounded-xl flex-col px-14 py-24 bg-bright border-[1px] border-main">
                <h2 className='text-2xl font-bold'>Восстановление пароля</h2>
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
                    <button className='bg-main border-[1px] mx-auto border-dark px-6 py-2 text-xl w-fit rounded-lg hover:bg-lbrown hover:text-bright' type="submit">Отправить код</button>
                    <button className="hover:underline cursor-pointer" onClick={()=>navigate("/recoveryAccept")}>Уже есть код?</button>
                </form>
            </div>
        </div>
    );
};

export default RecoverySend;