import { useEffect, useState } from "react";
import { socket } from "../../../../utils/socket"
import { Chat as ChatModel } from "../../../../utils/models";

export default function Chat() {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [chats, setChats] = useState<ChatModel[]>([])

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onInit(msg) {
            console.log(msg)
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('init', onInit);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <div className="w-full flex justify-center h-[100vh]">
            <div className="w-[65%] h-[85%] border-dark border-[1px] rounded-md">
                <div className="w-1/4 flex flex-col items-center border-r-[1px] border-dark h-full">
                    <h1 className="text-xl mt-2">Список чатов</h1>
                </div>
            </div>
        </div>
    )
}