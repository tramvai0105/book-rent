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

            const [listing] = await db.query(`
                SELECT id AS listingId, bookId FROM Listings
                WHERE id = ?
            `, [chat.listingId]);

            const [book] = await db.query(`
                SELECT title, photoUrls FROM Books
                WHERE id = ?
            `, [listing[0].bookId]);

            const otherUserId = chat.sellerId === userId ? chat.buyerId : chat.sellerId;
            const [otherUser] = await db.query(`
                SELECT * FROM users
                WHERE id = ?
            `, [otherUserId]);

            return {
                ...chat,
                listingId: listing[0].listingId,
                bookTitle: book[0].title,
                bookPhoto: book[0].photoUrls,
                otherUserName: otherUser[0].name,
                otherUserAvatar: otherUser[0].avatarUrl,
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