import book from "../../../../assets/book.jpg"

export default function BookCard(){
    return(<div className="w-full p-3 gap-1 text-lg flex items-center flex-col rounded-md drop-shadow-lg h-[400px] bg-bright">
        <img className="w-[280px] rounded-md h-[250px] object-cover" src={book}/>
        <span className="text-lbrown font-medium text-xl mt-4">Мэри Шэлли - Франкенштейн</span>
        <span className="font-bold">470 ₽</span>
        <span className="">г. Краснодар</span>
    </div>)
}