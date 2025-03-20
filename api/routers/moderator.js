import express from 'express'
const moderatorRouter = express.Router()
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
            img: row.img ? JSON.parse(row.img)[0] : '',
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

export default moderatorRouter;