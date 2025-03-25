import db from "./api/db.js";

export async function fetchUserChats(userId) {
    try {
        const [chats] = await db.query(`
            SELECT * FROM Chats
            WHERE sellerId = ? OR buyerId = ?
        `, [userId, userId]);

        const chatMessagesPromises = chats.map(async (chat) => {
            const [messages] = await db.query(`
                SELECT * FROM ChatMessages
                WHERE chatId = ?
            `, [chat.id]);

            return {
                ...chat,
                messages: messages.map(message => ({
                    id: message.id,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    chatId: message.chatId,
                    message: message.message,
                    createdAt: message.createdAt
                }))
            };
        });

        const chatsWithMessages = await Promise.all(chatMessagesPromises);
        return chatsWithMessages;
    } catch (error) {
        console.error('Error fetching user chats:', error);
        throw error;
    }
};

export function onlyForHandshake(middleware) {
    return (req, res, next) => {
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
}