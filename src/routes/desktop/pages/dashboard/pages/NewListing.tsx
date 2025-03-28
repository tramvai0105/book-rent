import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewListing() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publicationYear: '',
        genre: '',
        address: '',
        city: '',
        phoneNumber: '',
        description: '',
        wealth: '',
        interactionType: 'rent',
        rentPricePerMonth: '',
        deposit: '',
        salePrice: '',
        photos: null,
    }); // Тестовая инит формдата

    const [previewImages, setPreviewImages] = useState([]);
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photos') {
            setFormData({
                ...formData,
                photos: files,
            });
            /// Для отображения превью изображений
            const imagesArray = Array.from(files).map(file => URL.createObjectURL(file));
            setPreviewImages(imagesArray);
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        if(formData.interactionType == "rent"){
            formData.salePrice = "0";
        }
        if(formData.interactionType == "sale"){
            formData.rentPricePerMonth = "0";
            formData.deposit = "0"
        }
        for (const key in formData) {
            if (key === 'photos') {
                if(!formData.photos || formData.photos.length == 0){
                    alert("Добавьте хотя бы одно фото");
                    return;
                }
                for (let i = 0; i < formData.photos.length; i++) {
                    data.append('photos', formData.photos[i]);
                }
            } else {
                data.append(key, formData[key]);
            }
        }

        try {
            const response = await fetch('/api/b/addBook', {
                method: 'POST',
                body: data,
            });
            const result = await response.json();
            navigate("/dashboard")
            alert(result.message);
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при добавлении книги');
        }
    };

    return (
        <form className='flex w-full h-full flex-col gap-2' onSubmit={handleSubmit}>
            <h1 className='text-2xl'>Создание нового объявления</h1>
            <div className='w-full h-[1px] bg-dark'></div>
            <h2 className='text-xl font-bold text-lbrown'>Название книги</h2>
            <input
                name='title'
                value={formData.title}
                onChange={handleChange}
                placeholder='Введите название книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Автор</h2>
            <input
                name='author'
                value={formData.author}
                onChange={handleChange}
                placeholder='Введите автора книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Год издания</h2>
            <input
                name='publicationYear'
                value={formData.publicationYear}
                onChange={handleChange}
                placeholder='Введите год издания книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Жанр</h2>
            <input
                name='genre'
                value={formData.genre}
                onChange={handleChange}
                placeholder='Введите жанр книги...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Адрес встречи</h2>
            <input
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Введите адрес встречи...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Город</h2>
            <input
                name='city'
                value={formData.city}
                onChange={handleChange}
                placeholder='Введите город...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Ваш номер телефона</h2>
            <input
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder='Введите ваш номер телефона...'
                className='w-full pl-2 h-[45px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Загрузите изображения</h2>
            <input
                type='file'
                name='photos'
                onChange={handleChange}
                multiple
                className='w-full pl-2 h-[45px] bg-main rounded-md'
            />
            <div className="flex flex-wrap gap-2">
                {previewImages.map((image, index) => (
                    <img key={index} src={image} alt={`preview-${index}`} className="w-24 h-24 object-cover rounded-md" />
                ))}
            </div>
            <h2 className='text-xl font-bold text-lbrown'>Описание</h2>
            <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Текст описания...'
                className='w-full resize-none pl-2 h-[200px] bg-main rounded-md'
                required
            />
            <h2 className='text-xl font-bold text-lbrown'>Состояние</h2>
            <textarea
                name='wealth'
                value={formData.wealth}
                onChange={handleChange}
                placeholder='Текст описания...'
                className='w-full pl-2 resize-none h-[120px] bg-main rounded-md'
                required
            />
            <div className="flex ml-6 flex-col gap-1">
                <div className='flex flex-row items-center'>
                    <label className='w-1/3 flex flex-row items-center text-xl gap-4 font-bold text-lbrown'>
                        <input
                            type="radio"
                            name="interactionType"
                            value="rent"
                            checked={formData.interactionType === 'rent'}
                            onChange={handleChange}
                        />
                        Аренда
                    </label>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Стоимость</h2>
                        <input
                            name='rentPricePerMonth'
                            type='number'
                            value={formData.rentPricePerMonth}
                            onChange={handleChange}
                            placeholder=''
                            className='w-[40%] pl-2 h-[35px] bg-main rounded-md'
                            required={formData.interactionType == "rent" || formData.interactionType == "both"}
                        />
                    </div>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Сумма залога</h2>
                        <input
                            name='deposit'
                            type='number'
                            value={formData.deposit}
                            onChange={handleChange}
                            placeholder=''
                            className='w-[40%] pl-2 h-[35px] bg-main rounded-md'
                            required={formData.interactionType == "rent" || formData.interactionType == "both"}
                        />
                    </div>
                </div>
                <div className='flex flex-row items-center'>
                    <label className='w-1/3 flex flex-row items-center gap-4 text-xl font-bold text-lbrown'>
                        <input
                            type="radio"
                            name="interactionType"
                            value="sale"
                            checked={formData.interactionType === 'sale'}
                            onChange={handleChange}
                        />
                        Продажа
                    </label>
                    <div className='w-1/3 flex flex-row gap-4 items-center'>
                        <h2 className='text-base font-bold text-lbrown'>Стоимость</h2>
                        <input
                            type='number'
                            name='salePrice'
                            value={formData.salePrice}
                            onChange={handleChange}
                            placeholder=''
                            className='pl-2 w-[40%] h-[35px] bg-main rounded-md'
                            required={formData.interactionType == "sale" || formData.interactionType == "both"}
                        />
                    </div>
                </div>
                <label className='w-1/3 flex flex-row items-center gap-4 text-xl font-bold text-lbrown'>
                    <input
                        type="radio"
                        name="interactionType"
                        value="both"
                        checked={formData.interactionType === 'both'}
                        onChange={handleChange}
                    />
                    Оба способа
                </label>
            </div>
            <button type="submit" className='mt-4 cursor-pointer bg-lbrown text-white rounded-md p-2'>Добавить книгу</button>
        </form>
    );
}