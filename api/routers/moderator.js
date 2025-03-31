import express from 'express'
const moderatorRouter = express.Router()
import { config } from 'dotenv';
import db from '../db.js';
import { isAuthenticatedAndVerified, isModerator } from '../middleware.js';
import multer from "multer";
const storage = multer.diskStorage({
    destination: "files/",
    filename: function (req, file, callback) {
        callback(null, Date.now() + ".jpg");
    }
});
const upload = multer({ storage: storage })
config();

moderatorRouter.use(isAuthenticatedAndVerified);
moderatorRouter.use(isModerator);

moderatorRouter.get("/listings", async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query(`
                SELECT 
                l.id,
                l.userId,
                b.title,
                b.author,
                b.publicationYear,
                b.genre,
                b.description,
                b.wealth,
                l.interactionType,
                l.rentPricePerMonth,
                l.salePrice,
                l.address,
                l.deposit,
                l.city,
                l.phoneNumber,
                l.deliveryMethod,
                JSON_UNQUOTE(b.photoUrls) AS img,
                u.email,
                u.name AS sellerName,
                u.avatarUrl,
                u.contactInfo
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON l.userId = u.id
            WHERE l.status = "pending"`);

        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        const listingsData = rows.map(row => ({
            id: row.id,
            title: row.title,
            img: row.img ? JSON.parse(row.img) : '',
            description: row.description,
            wealth: row.wealth,
            author: row.author,
            publicationYear: row.publicationYear,
            genre: row.genre,
            sellerName: row.sellerName,
            interactionType: row.interactionType,
            rentPricePerMonth: row.rentPricePerMonth,
            salePrice: row.salePrice,
            deposit: row.deposit,
            phoneNumber: row.phoneNumber,
            address: row.address,
            city: row.city,
            deliveryMethod: row.deliveryMethod,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));

        res.json(listingsData);
    } catch (error) {
        console.error("Ошибка при получении объявлений:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.get("/disputes", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                d.id,
                d.rentalId,
                d.moderatorId,
                d.description,
                d.chatId,
                JSON_UNQUOTE(b.photoUrls) AS bookImages,
                JSON_UNQUOTE(d.images) AS images,
                d.status,
                d.createdAt,
                d.updatedAt,
                r.renterId,
                b.title,
                b.author,
                l.rentPricePerMonth,
                l.deposit,
                l.address,
                r.startDate,
                r.endDate,
                u_renter.name AS renterName,
                u_renter.email AS renterEmail,
                u_seller.name AS sellerName,
                u_seller.email AS sellerEmail
            FROM Disputes d
            JOIN rentals r ON d.rentalId = r.id
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u_renter ON r.renterId = u_renter.id
            JOIN users u_seller ON l.userId = u_seller.id
        `);

        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        const disputesData = rows.map(row => ({
            id: row.id,
            rentalId: row.rentalId,
            moderatorId: row.moderatorId,
            description: row.description,
            chatId: row.chatId,
            bookImages: JSON.parse(row.bookImages) || '',
            images: JSON.parse(row.images) || '',
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            renterId: row.renterId,
            title: row.title,
            author: row.author,
            address: row.address,
            rentPricePerMonth: row.rentPricePerMonth,
            deposit: row.deposit,
            startDate: row.startDate,
            endDate: row.endDate,
            renterName: row.renterName,
            renterEmail: row.renterEmail,
            sellerName: row.sellerName,
            sellerEmail: row.sellerEmail,
        }));

        res.json(disputesData);
    } catch (error) {
        console.error("Ошибка при получении диспутов:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.get("/dispute/:id", async (req, res) => {
    const disputeId = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT 
                d.id,
                d.rentalId,
                d.moderatorId,
                d.description,
                d.chatId,
                JSON_UNQUOTE(b.photoUrls) AS bookImages,
                JSON_UNQUOTE(d.images) AS images,
                d.status,
                d.createdAt,
                d.updatedAt,
                r.renterId,
                b.title,
                b.author,
                l.rentPricePerMonth,
                l.deposit,
                l.address,
                r.startDate,
                r.endDate,
                u_renter.name AS renterName,
                u_renter.email AS renterEmail,
                u_seller.name AS sellerName,
                u_seller.email AS sellerEmail
            FROM Disputes d
            JOIN rentals r ON d.rentalId = r.id
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u_renter ON r.renterId = u_renter.id
            JOIN users u_seller ON l.userId = u_seller.id
            WHERE d.id = ?
        `, [disputeId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Диспут не найден." });
        }

        const disputeData = {
            id: rows[0].id,
            rentalId: rows[0].rentalId,
            moderatorId: rows[0].moderatorId,
            description: rows[0].description,
            chatId: rows[0].chatId,
            bookImages: JSON.parse(rows[0].bookImages) || '',
            images: JSON.parse(rows[0].images) || '',
            status: rows[0].status,
            createdAt: rows[0].createdAt,
            updatedAt: rows[0].updatedAt,
            renterId: rows[0].renterId,
            title: rows[0].title,
            author: rows[0].author,
            address: rows[0].address,
            rentPricePerMonth: rows[0].rentPricePerMonth,
            deposit: rows[0].deposit,
            startDate: rows[0].startDate,
            endDate: rows[0].endDate,
            renterName: rows[0].renterName,
            renterEmail: rows[0].renterEmail,
            sellerName: rows[0].sellerName,
            sellerEmail: rows[0].sellerEmail,
        };

        res.json(disputeData);
    } catch (error) {
        console.error("Ошибка при получении диспута:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.get("/chat/:chatId", async (req, res) => {
    const chatId = req.params.chatId;

    try {
        const [chatRows] = await db.query(`
            SELECT sellerId, buyerId
            FROM Chats
            WHERE id = ?
        `, [chatId]);

        if (chatRows.length === 0) {
            return res.status(404).json({ message: "Чат не найден." });
        }

        const { sellerId, buyerId } = chatRows[0];

        const [messageRows] = await db.query(`
            SELECT 
                cm.id,
                cm.senderId,
                cm.receiverId,
                cm.message,
                cm.createdAt
            FROM сhatmessages cm
            WHERE cm.chatId = ?
            ORDER BY cm.createdAt ASC
        `, [chatId]);

        let chatMessages = [];

        chatMessages = messageRows.map(row => {
            // Определяем, кто является арендатором, а кто арендодателем
            const role = row.senderId === sellerId ? 'Арендодатель' : 'Арендатор';

            return {
                id: row.id,
                senderId: row.senderId,
                receiverId: row.receiverId,
                message: row.message,
                createdAt: row.createdAt,
                role: role,
            };
        });

        res.json(chatMessages);
    } catch (error) {
        console.error("Ошибка при получении сообщений чата:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.put("/publish/:id", async (req, res) => {
    const listingId = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT id FROM Listings 
            WHERE id = ? AND status = "pending"
        `, [listingId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Объявление не найдено или уже опубликовано." });
        }

        await db.query(`
            UPDATE Listings 
            SET status = "approved" 
            WHERE id = ?
        `, [listingId]);

        res.status(200).json({ message: "Объявление успешно опубликовано." });
    } catch (error) {
        console.error("Ошибка при публикации объявления:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.put("/reject/:id", async (req, res) => {
    const listingId = req.params.id;
    const { rejectionReason } = req.body;
    const moderatorId = req.user.id;

    if (!rejectionReason) {
        return res.status(400).json({ message: "Причина отказа обязательна." });
    }

    try {
        const [rows] = await db.query(`
            SELECT id FROM Listings 
            WHERE id = ? AND status = "pending"
        `, [listingId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Объявление не найдено или уже обработано." });
        }


        await db.query(`
            UPDATE Listings 
            SET status = "rejected" 
            WHERE id = ?
        `, [listingId]);

        await db.query(`
            INSERT INTO Moderations (listingId, moderatorId, status, rejectionReason) 
            VALUES (?, ?, 'rejected', ?)
        `, [listingId, moderatorId, rejectionReason]);

        res.status(200).json({ message: "Объявление успешно отклонено." });
    } catch (error) {
        console.error("Ошибка при отклонении объявления:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

moderatorRouter.post('/transferDepositToSeller', async (req, res) => {
    try {
        const { disputeId } = req.body;
        
        // Проверяем, существует ли диспут
        const [dispute] = await db.query('SELECT * FROM Disputes WHERE status="pending" AND id = ?', [disputeId]);
        if (dispute.length === 0) {
            return res.status(404).json({ message: 'Диспут не найден' });
        }

        const rentalId = dispute[0].rentalId; // Получаем rentalId из диспута
        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        const depositAmount = listing[0].deposit;
        const renterId = rental[0].renterId;
        const sellerId = listing[0].userId;

        // Переводим залог арендодателю
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [depositAmount, sellerId]);
        await db.query('UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?', [depositAmount, renterId]);

        // Создаем запись о транзакции
        const transaction = {
            fromUserId: renterId,
            toUserId: sellerId,
            amount: depositAmount,
            transactionType: 'user_to_user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO transactions SET ?', transaction);

        // Обновляем статус аренды и объявления
        await db.query('UPDATE rentals SET status = "completed" WHERE id = ?', [rentalId]);
        await db.query('UPDATE listings SET status = "closed" WHERE id = ?', [listing[0].id]);

        // Закрываем диспут
        await db.query('UPDATE Disputes SET status = "resolved", updatedAt = ? WHERE id = ?', [new Date(), disputeId]);

        res.status(200).json({ message: 'Залог успешно переведен арендодателю и диспут закрыт' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: JSON.stringify(error) });
    }
});

moderatorRouter.post('/returnDepositToRenter', async (req, res) => {
    try {
        const { disputeId } = req.body;

        const validationResult = schemaInspector.validate(disputeIdSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        const [dispute] = await db.query('SELECT * FROM Disputes WHERE status="pending" AND id = ?', [disputeId]);
        if (dispute.length === 0) {
            return res.status(404).json({ message: 'Диспут не найден' });
        }

        const rentalId = dispute[0].rentalId;
        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        const depositAmount = listing[0 ].deposit;
        const renterId = rental[0].renterId;
        const sellerId = listing[0].userId;

        await db.query('UPDATE users SET balance = balance + ?, frozenBalance = frozenBalance - ? WHERE id = ?', [depositAmount, depositAmount, renterId]);

        // Создаем запись о транзакции
        const transaction = {
            fromUserId: sellerId,
            toUserId: renterId,
            amount: depositAmount,
            transactionType: 'user_to_user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO transactions SET ?', transaction);

        // Обновляем статус аренды и объявления
        await db.query('UPDATE rentals SET status = "completed" WHERE id = ?', [rentalId]);
        await db.query('UPDATE listings SET status = "closed" WHERE id = ?', [listing[0].id]);

        // Закрываем диспут
        await db.query('UPDATE Disputes SET status = "resolved", updatedAt = ? WHERE id = ?', [new Date(), disputeId]);

        res.status(200).json({ message: 'Залог успешно возвращен арендатору и диспут закрыт' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: JSON.stringify(error) });
    }
});

export default moderatorRouter;