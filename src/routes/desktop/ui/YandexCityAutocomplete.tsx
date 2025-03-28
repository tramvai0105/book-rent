import React, { useEffect, useState } from 'react';

interface Suggestion {
    street: string,
    city: string,
}

function YandexCityAutocomplete({setter}:{setter: (suggestion: Suggestion)=>void}) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

    const handleChange = async (event) => {
        const value = event.target.value;
        setInputValue(value);

        try {
            if (value.length > 2) {
                const res = await fetch(`https://suggest-maps.yandex.ru/v1/suggest?apikey=${import.meta.env.VITE_YANDEX_API_KEY}&text=${value}&results=3`);
                const data = await res.json();
                // const features = data?.response?.GeoObjectCollection?.featureMember || [];
                console.log(data.results)
                const newSuggestions = data.results.map(result => { return { street: result.title.text, city: result.subtitle.text } });
                setSuggestions(newSuggestions);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(()=>{
        if(selectedSuggestion){
            setter(selectedSuggestion)
        }
    },[selectedSuggestion])

    const handleSelect = (suggestion) => {
        setSelectedSuggestion(suggestion);
        console.log(suggestion)
        setInputValue(suggestion.city + ", " + suggestion.street);
        setSuggestions([]);
    };

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                className='border-[1px] border-dark rounded-md pl-1 w-full'
                placeholder="Введите город"
                list="address"
            />
            <datalist id="address">
                {suggestions.map((suggestion, index) => (
                    <option
                        key={index}
                        onClick={() => handleSelect(suggestion)}
                        value={suggestion.city + ", " + suggestion.street}>
                    </option>
                ))}
            </datalist>
        </div>
    );
};

export default YandexCityAutocomplete;