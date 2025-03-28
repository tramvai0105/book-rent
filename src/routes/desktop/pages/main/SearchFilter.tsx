import { useEffect, useRef, useState } from "react";
import { Filter } from "./MainPage";
import YandexCityAutocomplete, { Suggestion } from "../../ui/YandexCityAutocomplete";

export default function SearchFilter({ setFilters }: { setFilters: (k: string, v: any) => void }) {
    
    const [city, setCity] = useState('');
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');
    const [serviceType, setServiceType] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    function clear(){
        setCity('');
        setPriceFrom('');
        setPriceTo('');
        setYearFrom('');
        setYearTo('');
        setServiceType('');
        setFilters("city", "");
        setFilters("priceFrom", "");
        setFilters("priceTo", "");
        setFilters("yearFrom", "");
        setFilters("yearTo", "");
        setFilters("serviceType", "");
        if(inputRef.current){
            inputRef.current.clear()
        }
    }

    function setterForCity(sug: Suggestion){
        setCity(sug.city);
        setFilters("city", sug.city)
    }

    return (
        <form className="w-[320px] drop-shadow-lg rounded-md h-fit bg-main flex flex-col text-xl py-4 pb-8 gap-3 px-2">
            <div className="w-full gap-3 items-center flex flex-col">
                <h1 className="text-2xl">Фильтры</h1>
                <YandexCityAutocomplete ref={inputRef} setter={setterForCity} placeholder="Город" className="w-[70%] pl-1 rounded-xl bg-white"/>
                {/* <input
                    placeholder="Город"
                    className="w-[70%] pl-1 rounded-xl bg-white"
                    value={city}
                    name="city"
                    onChange={(e) => {
                        setCity(e.target.value);
                        setFilters(e.target.name, e.target.value); // Обновляем состояние
                    }}
                /> */}
            </div>
            <div className="flex flex-col gap-2 w-full items-center">
                <h2>Цена, ₽</h2>
                <div className="flex text-lg justify-center flex-row gap-4">
                    <input
                        placeholder="От"
                        className="w-[42%] pl-1 bg-white rounded-md"
                        value={priceFrom}
                        name="priceFrom"
                        onChange={(e) => {
                            setPriceFrom(e.target.value);
                            setFilters(e.target.name, e.target.value); // Обновляем состояние
                        }}
                    />
                    <input
                        placeholder="До"
                        className="w-[42%] pl-1 bg-white rounded-md"
                        value={priceTo}
                        name="priceTo"
                        onChange={(e) => {
                            setPriceTo(e.target.value);
                            setFilters(e.target.name, e.target.value); // Обновляем состояние
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full items-center">
                <h2>Год издания</h2>
                <div className="flex text-lg justify-center flex-row gap-4">
                    <input
                        placeholder="От"
                        className="w-[42%] pl-1 bg-white rounded-md"
                        value={yearFrom}
                        name="yearFrom"
                        onChange={(e) => {
                            setYearFrom(e.target.value);
                            setFilters(e.target.name, e.target.value); // Обновляем состояние
                        }}
                    />
                    <input
                        placeholder="До"
                        className="w-[42%] pl-1 bg-white rounded-md"
                        value={yearTo}
                        name="yearTo"
                        onChange={(e) => {
                            setYearTo(e.target.value);
                            setFilters(e.target.name, e.target.value); // Обновляем состояние
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div className="w-full justify-center flex">Тип услуги</div>
                <div className="flex ml-6 flex-col gap-1">
                    <label>
                        <input
                            type="radio"
                            name="serviceType"
                            value="rent"
                            checked={serviceType === 'rent'}
                            onChange={(e) => {
                                setServiceType(e.target.value);
                                setFilters(e.target.name, e.target.value); // Обновляем состояние
                            }}
                        />
                        Аренда
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="serviceType"
                            value="sale"
                            checked={serviceType === 'sale'}
                            onChange={(e) => {
                                setServiceType(e.target.value);
                                setFilters(e.target.name, e.target.value); // Обновляем состояние
                            }}
                        />
                        Продажа
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="serviceType"
                            value="both"
                            checked={serviceType === 'both'}
                            onChange={(e) => {
                                setServiceType(e.target.value);
                                setFilters(e.target.name, e.target.value); // Обновляем состояние
                            }}
                        />
                        Оба способа
                    </label>
                </div>
            </div>
            <button className="hover:underline" onClick={(e)=>{e.preventDefault(); clear()}}>Сбросить фильтры</button>
        </form>
    );
}