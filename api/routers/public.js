import express from 'express'
const publicRouter = express.Router()
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

publicRouter.get("/listings", async (req, res) => {
    const { name } = req.query;
    try {
        let query = `
            SELECT 
                l.id,
                b.title,
                b.author,
                b.publicationYear,
                l.interactionType,
                l.rentPricePerMonth,
                l.salePrice,
                JSON_UNQUOTE(b.photoUrls) AS img,
                l.city
            FROM Listings l
            JOIN Books b ON l.bookId = b.id
            WHERE l.status = 'approved'
        `;

        // Если параметр name присутствует, добавляем условие WHERE
        if (name) {
            query += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
        }

        const params = [];
        if (name) {
            // Добавляем параметры для LIKE-запроса
            const searchTerm = `%${name}%`; // Используем % для поиска по подстроке
            params.push(searchTerm, searchTerm);
        }

        const [rows] = await db.query(query, params);

        const bookCardData = rows.map(row => {
            const { interactionType, rentPricePerMonth, salePrice } = row;

            // Initialize the response object
            const cardData = {
                id: row.id,
                title: row.title,
                author: row.author,
                publicationYear: row.publicationYear,
                img: JSON.parse(row.img)[0] || '',
                city: row.city,
                interactionType: interactionType,
            };

            // Set prices based on interactionType
            if (interactionType === 'rent') {
                cardData.rentPricePerMonth = rentPricePerMonth || 0;
                cardData.salePrice = null; // No sale price for rent-only listings
            } else if (interactionType === 'sale') {
                cardData.rentPricePerMonth = null; // No rent price for sale-only listings
                cardData.salePrice = salePrice || 0;
            } else if (interactionType === 'both') {
                cardData.rentPricePerMonth = rentPricePerMonth || 0;
                cardData.salePrice = salePrice || 0;
            }

            return cardData;
        });

        res.json(bookCardData);
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

publicRouter.get("/listings/:id", async (req, res) => {
    const listingId = req.params.id;
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
            WHERE l.id = ?
        `, [listingId]);

        const bookCardData = rows.map(row => {
            const { interactionType, rentPricePerMonth, salePrice } = row;

            const cardData = {
                id: row.id,
                title: row.title,
                author: row.author,
                publicationYear: row.publicationYear,
                interactionType: row.interactionType,
                genre: row.genre,
                img: JSON.parse(row.img)[0] || '',
                city: row.city,
                address: row.address,
                sellerName: row.sellerName,
                phoneNumber: row.phoneNumber,
                description: row.description || '',
                wealth: row.wealth || '',
                deposit: row.deposit,
                salePrice: salePrice || 0,
                rentPrice: rentPricePerMonth || 0,
                email: row.email,
                avatarUrl: row.avatarUrl || '',
                contactInfo: row.contactInfo || '',
            };

            if (interactionType === 'rent') {
                cardData.rentPrice = rentPricePerMonth || 0;
                cardData.salePrice = null;
            } else if (interactionType === 'sale') {
                cardData.rentPrice = null;
                cardData.salePrice = salePrice || 0;
            } else if (interactionType === 'both') {
                cardData.rentPrice = rentPricePerMonth || 0;
                cardData.salePrice = salePrice || 0;
            }

            return cardData;
        });

        res.json(bookCardData[0]);
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default publicRouter;