import React, { useState } from 'react';

function YandexCityAutocomplete(){
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = async (event) => {
        const value = event.target.value;
        setInputValue(value);

        if (value.length > 2) {
            const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${import.meta.env.VITE_YANDEX_API_KEY}&geocode=${value}&format=json`);
            const data = await res.json();
            const features = data?.response?.GeoObjectCollection?.featureMember || [];
            const newSuggestions = features.map(feature => feature.GeoObject.name);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (suggestion) => {
        setInputValue(suggestion);
        setSuggestions([]);
    };

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder="Введите город"
            />
            <div>
                {suggestions.map((suggestion, index) => (
                    <div key={index} onClick={() => handleSelect(suggestion)}>
                        {suggestion}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YandexCityAutocomplete;