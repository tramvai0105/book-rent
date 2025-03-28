import { useEffect, useRef, useState } from "react";
import { socket } from "../../../../utils/socket"
import { ChatMessage } from "../../../../utils/models";
import { useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import store from "../../../../utils/store";
import { observer } from "mobx-react-lite";

export interface ChatModel {
    id: number;
    sellerId: number;
    buyerId: number;
    messages: ChatMessage[];
    listingId: number;
    bookTitle: string;
    bookPhoto: string;
    otherUserAvatar: string;
    otherUserName: string;
    createdAt: Date;
    updatedAt: Date;
}

function _Chat() {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [chats, setChats] = useState<ChatModel[]>([])
    const [currentChatId, setCurrentChatId] = useState(0);
    const [messageInputData, setMessageInputData] = useState("");
    const messagesRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();

    function selectChat(id: number) {
        setCurrentChatId(id);
    }

    function sendMessage() {
        socket.emit("sendMessage", { chatId: chats[currentChatId].id, message: messageInputData })
    }

    function onNewMessage(msg: ChatMessage) {
        setChats((prev) => {
            prev = prev.map((c) => { if (c.id == msg.chatId) { return { ...c, messages: [...c.messages, msg] } } else return c })
            return prev;
        })
    }

    useEffect(()=>{
        if(messagesRef.current){
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    },[chats])

    useEffect(() => {
        // Если создаем новый чат нас переносит на страницу чата с параметром поиска
        // Тут открываем свежесозданный чат
        const id = searchParams.get('id');
        if (id && !isNaN(Number(id))) {
            const queriedChat = chats.find(chat => chat.listingId === Number(id));
            if (queriedChat) {
                setCurrentChatId(chats.indexOf(queriedChat));
            }
        }
    }, [searchParams]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onInit(_chats: ChatModel[]) {
            setChats(_chats);
            const id = searchParams.get('id');
            if (id && !isNaN(Number(id))) {
                const queriedChat = _chats.find(chat => chat.listingId === Number(id));
                if (queriedChat) {
                    setCurrentChatId(_chats.indexOf(queriedChat));
                }
            }
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('init', onInit);
        socket.on('disconnect', onDisconnect);
        socket.on("newMessage", onNewMessage)

        socket.emit('requestInitData');
        return () => {
            socket.off('connect', onConnect);
            socket.off('init', onInit);
            socket.off('disconnect', onDisconnect);
            socket.off("newMessage", onNewMessage)
        };
    }, []);

    return (
        <div className="w-full flex justify-center h-[100vh]">
            <div className="w-[900px] bg-bright h-[600px] border-dark border-[1px] rounded-md flex flex-row">
                <div className="w-1/4 p-1 px-2 gap-2 flex flex-col items-center border-r-[1px] border-dark h-full">
                    <h1 className="text-xl mt-2">Список чатов</h1>
                    <div className="flex-grow w-full overflow-y-auto flex flex-col gap-2">
                        {chats.map((c, i) => <ChatListItem selected={i == currentChatId} id={i} select={selectChat} key={i} chat={c} />)}
                    </div>
                </div>
                <div className="h-full flex gap-2 flex-col w-3/4 p-2">
                    {chats.length > 0
                        ? <>
                            <div className="flex flex-none flex-row gap-2 justify-between">
                                <div className="flex flex-row items-center gap-2">
                                    <span className="text-lg text-center">Чат с </span>
                                    <span className="bg-lbrown px-4 text-xl rounded-md text-white w-fit ">{chats[currentChatId].otherUserName}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <span className="text-lg text-center">По объявлению </span>
                                    <button className="bg-lbrown px-4 text-xl rounded-md text-white w-fit ">{chats[currentChatId].bookTitle}</button>
                                </div>
                            </div>
                            <div ref={messagesRef} className="flex-grow overflow-y-auto flex flex-col gap-2">
                                {chats[currentChatId].messages.map((m, i) => <MessageItem own={store && store.getUserData() ? m.senderId == store.getUserData().id : false} avatar={chats[currentChatId].otherUserAvatar} key={i} data={m} />)}
                            </div>
                            <div className="flex flex-none flex-row gap-2">
                                <textarea value={messageInputData} onChange={(e) => setMessageInputData(e.target.value)} className="w-full pl-1 pt-1 mt-auto h-[125px] resize-none bg-white rounded-md" />
                                <button onClick={sendMessage} className="bg-lbrown px-4 rounded-lg text-xl hover:text-white">Отправить</button>
                            </div>
                        </>
                        : <div>Чаты ещё не прогрузились...</div>}
                </div>
            </div>
        </div>
    )
}

const Chat = observer(_Chat);
export default Chat;

function MessageItem({ data, avatar, own }: { data: ChatMessage, avatar: string, own: boolean }) {
    return (
        <div className="w-fit min-h-[35px] items-center gap-2 flex flex-row">
            <img className="w-[35px] h-[35px] rounded-full" src={`/${avatar}`} />
            <div className={clsx({"bg-blue-100":own}, {"bg-white":!own},"whitespace-pre px-4 h-full flex items-center rounded-full")}>{data.message}</div>
        </div>
    )
}

function ChatListItem({ chat, id, select, selected }: { chat: ChatModel, id: number, select: (id: number) => void, selected: boolean }) {
    return (
        <div onClick={() => select(id)} className={clsx({"border-dark": selected},{"border-white": !selected},"w-full gap-1 border-[1px] hover:border-main flex flex-col py-2 rounded-md hover:bg-main cursor-pointer px-1 bg-white h-fit")}>
            <div className="flex flex-row w-full items-center gap-2 text-sm">
                <img className="w-[40px] h-[40px] rounded-full" src={`/${chat.otherUserAvatar}`} />
                <span>{chat.otherUserName}</span>
            </div>
            <div className="text-lg flex justify-center px-2 py-1 border-lbrown border-b-[1px]">
                <span>{chat.bookTitle}</span>
            </div>
        </div>
    )
}
