import express from 'express'
const privateRouter = express.Router()
import { config } from 'dotenv';
import db from '../db.js';
import { isAuthenticatedAndVerified, isModerator } from '../middleware.js';
import multer from "multer";
import Joi from "joi"
const storage = multer.diskStorage({
    destination: "files/",
    filename: function (req, file, callback) {
        callback(null, Date.now() + ".jpg");
    }
});
const upload = multer({ storage: storage })
config();

privateRouter.use(isAuthenticatedAndVerified)

privateRouter.get("/listings", async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query(`
            SELECT 
                l.id,
                b.title,
                JSON_UNQUOTE(b.photoUrls) AS img,
                b.description,
                b.author,
                b.publicationYear,
                b.genre,
                b.wealth,
                l.interactionType,
                l.rentPricePerMonth,
                l.salePrice,
                l.deposit,
                l.phoneNumber,
                l.address,
                l.city,
                l.deliveryMethod,
                l.status,
                l.createdAt,
                l.updatedAt,
                m.rejectionReason
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            LEFT JOIN Moderations m ON l.id = m.listingId
            WHERE l.userId = ?
        `, [userId]);
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
            rejectionReason: row.rejectionReason || ""
        }));
        res.json(listingsData);
    } catch (error) {
        console.error("Ошибка при получении объявлений:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

privateRouter.delete("/listings/remove/:id", async (req, res) => {
    const userId = req.user.id;
    const listingId = req.params.id;

    try {
        // Проверяем, существует ли объявление и принадлежит ли оно пользователю
        const [rows] = await db.query(`
            SELECT id, status FROM Listings 
            WHERE id = ? AND userId = ?
        `, [listingId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Объявление не найдено или не принадлежит пользователю." });
        }

        const listing = rows[0];

        // Проверяем статус объявления
        if (listing.status === "closed" || listing.status === "process") {
            return res.status(403).json({ message: "Нельзя удалить объявление со статусом 'closed' или 'process'." });
        }

        // Удаляем все сообщения из таблицы сhatmessages, связанные с чатом
        const [chats] = await db.query(`
            SELECT id FROM chats 
            WHERE listingId = ?
        `, [listingId]);

        for (const chat of chats) {
            await db.query(`
                DELETE FROM сhatmessages 
                WHERE chatId = ?
            `, [chat.id]);
        }

        // Удаляем все записи из таблицы chats, связанные с данным listingId
        await db.query(`
            DELETE FROM chats 
            WHERE listingId = ?
        `, [listingId]);

        // Удаляем все записи о модерации для данного объявления
        await db.query(`
            DELETE FROM Moderations 
            WHERE listingId = ?
        `, [listingId]);

        // Удаляем само объявление
        await db.query(`
            DELETE FROM Listings 
            WHERE id = ?
        `, [listingId]);

        res.status(200).json({ message: "Объявление и связанные с ним модерации успешно удалены." });
    } catch (error) {
        console.error("Ошибка при удалении объявления:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

privateRouter.get("/orders", async (req, res) => {
    const userId = req.user.id;

    try {
        const [rentalsAsLessor] = await db.query(`
            SELECT 
                r.id AS rentalId,
                l.id AS listingId,
                b.title,
                b.author,
                l.rentPricePerMonth AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                r.startDate,
                r.endDate,
                r.status,
                u.name AS renterName
            FROM Rentals r
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON r.renterId = u.id
            WHERE l.userId = ? AND r.status NOT IN ('completed', 'cancelled')
        `, [userId]);

        const [rentalsAsRenter] = await db.query(`
            SELECT 
                r.id AS rentalId,
                l.id AS listingId,
                b.title,
                b.author,
                l.rentPricePerMonth AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                r.startDate,
                r.endDate,
                r.status,
                u.name AS lessorName
            FROM Rentals r
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON l.userId = u.id
            WHERE r.renterId = ? AND r.status NOT IN ('completed', 'cancelled')
        `, [userId]);

        const [purchases] = await db.query(`
            SELECT 
                p.id AS purchaseId,
                l.id AS listingId,
                b.title,
                b.author,
                l.salePrice AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                p.purchaseDate,
                p.status,
                u.name AS sellerName
            FROM Purchases p
            JOIN Listings l ON p.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON l.userId = u.id
            WHERE p.buyerId = ? AND p.status NOT IN ('completed', 'cancelled')
        `, [userId]);

        const [sales] = await db.query(`
            SELECT 
                p.id AS purchaseId,
                l.id AS listingId,
                b.title,
                b.author,
                l.salePrice AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                u.name AS buyerName
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            JOIN Purchases p ON l.id = p.listingId
            JOIN users u ON p.buyerId = u.id
            WHERE l.userId = ? AND l.interactionType IN ('sale', 'both') AND p.status NOT IN ('completed', 'cancelled')
        `, [userId]);

        const transactionsData = {
            rentalsAsLessor,
            rentalsAsRenter,
            purchases,
            sales
        };

        res.json(transactionsData);
    } catch (error) {
        console.error("Ошибка при получении транзакций:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

privateRouter.get('/balance', async (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из запроса

    try {
        // Выполняем запрос к базе данных для получения всех трех балансов пользователя
        const [user] = await db.query('SELECT balance, frozenBalance, withdrawnBalance FROM users WHERE id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Возвращаем все три баланса пользователя
        res.json({
            balance: user[0].balance,
            frozenBalance: user[0].frozenBalance,
            withdrawnBalance: user[0].withdrawnBalance
        });
    } catch (error) {
        console.error("Ошибка при получении балансов:", error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// ДЛЯ ТЕСТОВ ДОБАВЛЕНИЕ БАЛАНСА
privateRouter.post('/balance/add', async (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из запроса
    let { amount } = req.body; // Получаем сумму из тела запроса

    amount = Number(amount)
    if (isNaN(amount)) {
        return res.status(400).json({ message: 'Сумма должна быть числом' });
    }

    try {
        // Обновляем основной баланс пользователя
        const [result] = await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);

        // Проверяем, был ли обновлен баланс
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Возвращаем успешный ответ
        res.json({ message: 'Баланс успешно пополнен', newBalance: amount });
    } catch (error) {
        console.error("Ошибка при пополнении баланса:", error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// ДЛЯ ТЕСТОВ СМЕНА РОЛИ
privateRouter.post('/changeRole', async (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из токена или сессии

    try {
        // Получаем текущую роль пользователя
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Меняем роль на противоположную
        const newRole = user[0].role === 'user' ? 'moderator' : 'user';

        // Обновляем роль в базе данных
        await db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);

        res.status(200).json({ message: `Роль успешно изменена на ${newRole}` });
    } catch (error) {
        console.error('Ошибка при изменении роли:', error);
        res.status(500).json({ message: 'Произошла ошибка при изменении роли' });
    }
});

privateRouter.get('/history', async (req, res) => {
    const userId = req.user.id;

    try {
        const [rentalsAsLessor] = await db.query(`
            SELECT 
                r.id AS rentalId,
                l.id AS listingId,
                b.title,
                b.author,
                l.rentPricePerMonth AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                r.startDate,
                r.endDate,
                r.status,
                u.name AS renterName
            FROM Rentals r
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON r.renterId = u.id
            WHERE l.userId = ? AND r.status = 'completed'
        `, [userId]);

        const [rentalsAsRenter] = await db.query(`
            SELECT 
                r.id AS rentalId,
                l.id AS listingId,
                b.title,
                b.author,
                l.rentPricePerMonth AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                r.startDate,
                r.endDate,
                r.status,
                u.name AS lessorName
            FROM Rentals r
            JOIN Listings l ON r.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON l.userId = u.id
            WHERE r.renterId = ? AND r.status = 'completed'
        `, [userId]);

        const [purchases] = await db.query(`
            SELECT 
                p.id AS purchaseId,
                l.id AS listingId,
                b.title,
                b.author,
                l.salePrice AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.address,
                p.purchaseDate,
                p.status,
                u.name AS sellerName
            FROM Purchases p
            JOIN Listings l ON p.listingId = l.id
            JOIN Books b ON l.bookId = b.id
            JOIN users u ON l.userId = u.id
            WHERE p.buyerId = ? AND p.status = 'completed'
        `, [userId]);

        const [sales] = await db.query(`
            SELECT 
                p.id AS purchaseId,
                l.id AS listingId,
                b.title,
                b.author,
                l.salePrice AS price,
                JSON_UNQUOTE(b.photoUrls) AS img,
                p.purchaseDate,
                l.address,
                u.name AS buyerName
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            JOIN Purchases p ON l.id = p.listingId
            JOIN users u ON p.buyerId = u.id
            WHERE l.userId = ? AND l.interactionType IN ('sale', 'both') AND p.status = 'completed'
        `, [userId]);

        const transactionHistory = {
            rentalsAsLessor,
            rentalsAsRenter,
            purchases,
            sales
        };

        res.json(transactionHistory);
    } catch (error) {
        console.error("Ошибка при получении истории сделок:", error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

privateRouter.post('/changeAvatar', upload.single('avatar'), async (req, res) => {
    const userId = req.user.id;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        const avatarUrl = req.file.path;

        const [result] = await db.query('UPDATE users SET avatarUrl = ? WHERE id = ?', [avatarUrl, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({ message: 'Аватарка успешно изменена', avatarUrl });
    } catch (error) {
        console.error('Ошибка при изменении аватарки:', error);
        res.status(500).json({ message: JSON.stringify(error) });
    }
});

const changeNameSchema = Joi.object({
    newName: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Имя должно быть строкой',
            'string.min': 'Имя не может быть пустым',
            'any.required': 'Имя обязательно'
        }),
});

privateRouter.post('/changeName', async (req, res) => {
    const userId = req.user.id;
    const { newName } = req.body;

    // Валидация данных
    const { error } = changeNameSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const [result] = await db.query('UPDATE users SET name = ? WHERE id = ?', [newName, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        res.status(200).json({ message: 'Имя успешно изменено.' });
    } catch (error) {
        console.error('Ошибка при изменении имени:', error);
        res.status(500).json({ message: 'Произошла ошибка при изменении имени.' });
    }
});

privateRouter.post('/createChat', async (req, res) => {
    const userId = req.user.id;
    const { listingId } = req.body;

    try {
        let [listing] = await db.query('SELECT * FROM Listings WHERE id = ?', [listingId]);

        if (listing.length === 0) {
            return res.status(404).json({ message: 'Листинг не найден.' });
        }
        listing = listing[0];

        const sellerId = listing.userId;

        if (userId === sellerId) {
            return res.status(403).json({ message: 'Вы не можете создать этот чат.' });
        }

        const [existingChat] = await db.query(`
        SELECT * FROM Chats 
        WHERE ((sellerId = ? AND buyerId = ?) 
               OR (sellerId = ? AND buyerId = ?)) 
        AND listingId = ?`,
            [userId, sellerId, sellerId, userId, listingId]
        );

        if (existingChat.length > 0) {
            return res.status(200).json({ message: 'Чат уже существует.' });
        }

        const [result] = await db.query('INSERT INTO Chats (sellerId, buyerId, listingId) VALUES (?, ?, ?)', [sellerId, userId, listingId]);

        res.status(201).json({ message: 'Чат успешно создан.', chatId: result.insertId });
    } catch (error) {
        console.error('Ошибка при создании чата:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании чата.' });
    }
});

export default privateRouter;