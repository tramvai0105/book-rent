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
                l.updatedAt
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            WHERE l.userId = ? AND l.status = 'approved'
        `, [userId]);

        // Проверяем, есть ли объявления
        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        // Преобразуем данные в формат ListingData
        const listingsData = rows.map(row => ({
            id: row.id,
            title: row.title,
            img: row.img ? JSON.parse(row.img)[0] : '', // Предполагаем, что img - это JSON массив
            description: row.description,
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
        }));

        res.json(listingsData);
    } catch (error) {
        console.error("Ошибка при получении объявлений:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

export default privateRouter;