import React, { useState } from 'react'
import store from "../../../../../utils/store";
import { observer } from 'mobx-react-lite';

function _Options() {

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const response = await fetch('/api/private/changeAvatar', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке аватарки.');
                }
                const data = await response.json();
                alert(data.message || 'Аватарка успешно загружена!');
                store.fetchUser();
            } catch (error) {
                console.error('Ошибка при загрузке аватарки:', error);
            }
        }
    };

    const [newName, setNewName] = useState('');

    async function handleChangeName(){
        try {
            if(newName.length < 4){
                alert("Имя должно содержать минимум 4 символа.")
                return;
            }
            const response = await fetch('/api/private/changeName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при изменении имени.');
            }

            const data = await response.json();
            alert(data.message || 'Имя успешно изменено!');
            store.fetchUser();
        } catch (error) {
            console.error('Ошибка при изменении имени:', error);
        }
    };


    return (
        <div className='flex flex-col text-xl w-full rounded-2xl gap-6 px-6 py-12 border-dark border-[1px]'>
            <h1 className='text-2xl font-bold'>Настройки</h1>
            <span>Ваш адрес почты: <span>{store.getUserData()?.email}</span></span>
            <div className="w-full flex flex-row">
                <div className='w-1/2'>
                    <div className='flex flex-col gap-4 w-fit'>
                        <img src={`/${store.getUserData()?.avatarUrl}`} className="w-[270px] h-[320px] object-cover rounded-md" />
                        <input id="changeAvatar" type="file" accept="image/*" onChange={handleFileChange} style={{display: "none"}}/>
                        <label htmlFor="changeAvatar" className="cursor-pointer w-fit px-8 py-2 rounded-xl bg-lbrown text-xl 
                                border-[1px] border-lbrown hover:text-white">Изменить аватар</label>
                    </div>
                </div>
                <div className='flex flex-col gap-4 w-1/2'>
                    <span>Текущее имя: {store.getUserData()?.name}</span>
                    <div className='flex flex-row gap-2'>
                        <span>Новое имя:</span>
                        <input placeholder="Введите новое имя" onChange={(e) => setNewName(e.target.value)} className="w-[70%] border-dark border-[1px] pl-1 rounded-xl bg-white" />
                    </div>
                    <button onClick={handleChangeName} className="cursor-pointer px-8 py-2 rounded-xl bg-lbrown text-xl 
                    border-[1px] border-lbrown hover:text-white w-fit">Сохранить</button>
                </div>
            </div>
        </div>
    )
}

const Options = observer(_Options);
export default Options;

