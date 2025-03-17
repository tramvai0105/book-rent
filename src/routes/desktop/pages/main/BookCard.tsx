import { BookCardData } from "../../../../utils/interfaces";
import { useNavigate } from "react-router-dom";

export default function BookCard({card}:{card: BookCardData}) {

    const navigate = useNavigate();

    // if (loading) {
    //     return (<div className="w-full p-3 border-[1px] border-main animate-pulse gap-1 text-lg flex items-center flex-col rounded-md drop-shadow-lg h-[400px] bg-bright">

    //     </div>)
    // }

    return (<div onClick={()=>navigate(`/book/${card.id}`)} className="w-full p-3 cursor-pointer border-[1px] border-bright hover:border-main gap-1 text-lg flex items-center flex-col rounded-md drop-shadow-lg h-[400px] bg-bright">
        <img className="w-[280px] rounded-md h-[235px] max-h-[235px] object-cover" src={`${card.img}`} />
        <span className="text-lbrown font-medium text-xl mt-4">{card.author} - {card.title}</span>
        <div className="flex flex-row gap-2 justify-center text-sm">
            {card.interactionType == ("rent") || card.interactionType == ("both")
            ?<div className="px-2 rounded-sm bg-main">Аренда</div>:<></>}
            {card.interactionType == ("sale") || card.interactionType == ("both")
            ?<div className="px-2 rounded-sm bg-main">Продажа</div>:<></>}
        </div>
        <div className="flex flex-row gap-1 justify-center font-bold">
            {card.interactionType == ("rent") || card.interactionType == ("both")
            ?<div className="">{Number(card.rentPricePerMonth).toFixed(0)} ₽</div>:<></>}
            {card.interactionType == ("both")
            ?<div className="">/</div>:<></>}
            {card.interactionType == ("sale") || card.interactionType == ("both")
            ?<div className="">{Number(card.salePrice).toFixed(0)} ₽</div>:<></>}
        </div>

        <span className="">{card.city}</span>
    </div>)
}