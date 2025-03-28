import React, { Ref, useEffect, useImperativeHandle, useState } from 'react';

export interface Suggestion {
    street: string,
    city: string,
}

// Такой вот Апи-голЕм
function YandexCityAutocomplete({setter, className, placeholder, cityOnly = true, ref}:{setter: (suggestion: Suggestion)=>void, ref: React.RefObject<HTMLInputElement | null>, className?: string, placeholder?: string, cityOnly?: boolean}) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

    useImperativeHandle(ref, () => {
        return {
            clear(){
                setInputValue("")
            }
        };
      }, []);

    const handleChange = async (event) => {
        const value = event.target.value;
        setInputValue(value);

        try {
            if (value.length > 2) {
                const res = await fetch(`https://suggest-maps.yandex.ru/v1/suggest?apikey=${import.meta.env.VITE_YANDEX_API_KEY}&text=${value}&results=3&types=${cityOnly ? "locality" : "geo"}`);
                const data = await res.json();
                // const features = data?.response?.GeoObjectCollection?.featureMember || [];
                console.log(data.results)
                const newSuggestions = data.results.map(result => { return result.subtitle ? { street: result.title.text, city: result.subtitle.text } :  { street: "", city: result.title.text }});
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
        if(cityOnly){
            setInputValue(suggestion.city);
        }else{
            setInputValue(suggestion.city + ", " + suggestion.street);
        }
        
        setSuggestions([]);
    };

    return (
        <div>
            <input
                ref={ref}
                type="text"
                value={inputValue}
                onChange={handleChange}
                className={className}
                placeholder={placeholder}
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