import express from 'express'
const privateRouter = express.Router()
import { config } from 'dotenv';
import db from '../db.js';
import schemaInspector from 'schema-inspector';
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

privateRouter.use(isAuthenticatedAndVerified)

privateRouter.get("/listings", async (req, res) => {
    const userId = req.user.id; // Получаем идентификатор пользователя из запроса

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
            img: row.img ? JSON.parse(row.img)[0] : '',
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
            SELECT id FROM Listings 
            WHERE id = ? AND userId = ?
        `, [listingId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Объявление не найдено или не принадлежит пользователю." });
        }

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
        res.status(500).json({ message: 'Произошла ошибка при изменении аватарки' });
    }
});

const changeNameSchema = {
    type: 'object',
    properties: {
        newName: { type: 'string', minLength: 1 }, // Имя должно быть строкой и не пустым
    },
    required: ['newName'], // newName обязательно
};

privateRouter.post('/changeName', async (req, res) => {
    const userId = req.user.id;
    const { newName } = req.body; 

    const validationResult = schemaInspector.validate(changeNameSchema, req.body);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.format() });
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


export default privateRouter;