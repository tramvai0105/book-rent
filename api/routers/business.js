import express from 'express'
const businessRouter = express.Router()
import { config } from 'dotenv';
import db from '../db.js';
import schemaInspector from 'schema-inspector';
import { isAuthenticatedAndVerified } from '../middleware.js';
import multer from "multer";
const storage = multer.diskStorage({
    destination: "files/",
    filename: function (req, file, callback) {
        callback(null, Date.now() + ".jpg");
    }
});
const upload = multer({ storage: storage })
config();

businessRouter.use(isAuthenticatedAndVerified);

// Схема для добавления книги
const bookSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 4 },
        author: { type: 'string', minLength: 4 },
        publicationYear: { type: 'number', optional: true },
        genre: { type: 'string', minLength: 4 },
        address: { type: 'string', minLength: 4 },
        photoUrls: { type: 'array', items: { type: 'string' }, optional: true },
        phoneNumber: { type: 'string', optional: true },
        description: { type: 'string', maxLength: 500, optional: true },
        wealth: { type: 'string', maxLength: 500, optional: true },
        interactionType: { type: 'string', enum: ['rent', 'sale', 'both'] },
        rentPricePerMonth: { type: 'number', optional: true },
        deposit: { type: 'number', optional: true },
        salePrice: { type: 'number', optional: true },
    },
    required: ['title', 'author', 'publicationYear', 'genre', 'city', 'interactionType'],
};

// Роут для добавления книги
businessRouter.post('/addBook', upload.array('photos'), async (req, res) => {
    try {
        const { title, author, publicationYear, genre, wealth, address, phoneNumber, description, interactionType, rentPricePerMonth, deposit, salePrice } = req.body;

        const validationResult = schemaInspector.validate(bookSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Проверка на наличие загруженных файлов
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Необходимо загрузить хотя бы одно фото.' });
        }

        const photoUrls = JSON.stringify(req.files.map(file => file.path));
        const newBook = {
            title,
            author,
            publicationYear,
            genre,
            photoUrls,
            description,
            wealth,
            userId: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        let [addedBook] = await db.query('INSERT INTO books SET ?', newBook);
        const listing = {
            bookId: addedBook.insertId,
            userId: req.user.id,
            interactionType,
            rentPricePerMonth,
            salePrice,
            deposit,
            phoneNumber,
            address,
            city: req.user.city, 
            deliveryMethod: 'meetup',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO listings SET ?', listing);

        res.status(201).json({ message: 'Книга успешно добавлена и отправлена на модерацию' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при добавлении книги' });
    }
});

// Схема для аренды книги
const rentalSchema = {
    type: 'object',
    properties: {
        listingId: { type: 'number' },
    },
    required: ['listingId'],
};

// Роут для запроса аренды книги
businessRouter.post('/rentBook', async (req, res) => {
    try {
        const { listingId } = req.body;

        const validationResult = schemaInspector.validate(rentalSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Получаем информацию о listing, чтобы проверить владельца
        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Проверяем, является ли текущий пользователь владельцем объявления
        // if (listing[0].userId === req.user.id) {
        //     return res.status(403).json({ message: 'Вы не можете арендовать или купить свою собственную книгу' });
        // }

        const rental = {
            listingId,
            renterId: req.user.id,
            startDate: new Date(),
            endDate: null, // Дата окончания будет установлена при подтверждении
            status: 'pending', // Статус аренды устанавливаем как pending
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO rentals SET ?', rental);

        res.status(201).json({ message: 'Запрос на аренду книги отправлен владельцу' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при отправке запроса на аренду книги' });
    }
});

// Схема для подтверждения аренды
const confirmRentalSchema = {
    type: 'object',
    properties: {
        rentalId: { type: 'number' },
    },
    required: ['rentalId'],
};

// Роут для подтверждения аренды
businessRouter.post('/confirmRental', async (req, res) => {
    try {
        const { rentalId } = req.body;

        const validationResult = schemaInspector.validate(confirmRentalSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Проверяем, существует ли аренда с указанным ID и статусом pending
        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ? AND status = "pending"', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена или уже подтверждена' });
        }

        // Получаем информацию о listing, чтобы проверить владельца
        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Проверяем, является ли текущий пользователь владельцем объявления
        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        // Получаем информацию о пользователе-арендаторе
        const [renter] = await db.query('SELECT * FROM users WHERE id = ?', [rental[0].renterId]);
        if (renter.length === 0) {
            return res.status(404).json({ message: 'Арендатор не найден' });
        }

        // Обновляем статус аренды на active и устанавливаем дату окончания
        const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // Аренда на месяц
        await db.query('UPDATE rentals SET status = "active", endDate = ? WHERE id = ?', [endDate, rentalId]);

        // Обновляем баланс арендатора и владельца
        const rentPrice = listing[0].rentPricePerMonth; // Предполагается, что rentPricePerMonth хранится в listings
        const commission = rentPrice * 0.1; // 10% комиссии
        const ownerId = listing[0].userId; // ID владельца книги
        const depositAmount = listing[0].deposit; // Сумма залога

        // Списываем залог с арендатора
        await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [depositAmount + rentPrice, rental[0].renterId]);
        // Обновляем баланс владельца
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [rentPrice - commission, ownerId]);
        // Обновляем баланс модератора (пользователь с id 0)
        await db.query('UPDATE users SET balance = balance + ? WHERE id = 0', [commission + depositAmount]);

        // Создаем запись о залоге
        const deposit = {
            amount: depositAmount,
            renterId: rental[0].renterId,
            listingId: rental[0].listingId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO deposits SET ?', deposit);

        // Создаем записи о транзакциях
        const transactions = [
            {
                fromUserId: rental[0].renterId,
                toUserId: 0, // Модератор
                amount: depositAmount + commission,
                transactionType: 'user_to_service',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: rental[0].renterId,
                toUserId: ownerId,
                amount: rentPrice - commission,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // Вставляем все транзакции в базу данных
        for (const transaction of transactions) {
            await db.query('INSERT INTO transactions SET ?', transaction);
        }

        res.status(200).json({ message: 'Аренда успешно подтверждена и баланс обновлен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при подтверждении аренды' });
    }
});

// Схема для покупки книги
const purchaseSchema = {
    type: 'object',
    properties: {
        listingId: { type: 'number' },
    },
    required: ['listingId'],
};

// Роут для запроса покупки книги
businessRouter.post('/purchaseBook', async (req, res) => {
    try {
        const { listingId } = req.body;

        const validationResult = schemaInspector.validate(purchaseSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Проверяем, является ли текущий пользователь владельцем объявления
        // if (listing[0].userId === req.user.id) {
        //     return res.status(403).json({ message: 'Вы не можете арендовать или купить свою собственную книгу' });
        // }

        const purchase = {
            listingId,
            buyerId: req.user.id,
            purchaseDate: new Date(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO purchases SET ?', purchase);

        res.status(201).json({ message: 'Запрос на покупку книги отправлен владельцу' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при отправке запроса на покупку книги' });
    }
});

// Схема для подтверждения покупки
const confirmPurchaseSchema = {
    type: 'object',
    properties: {
        purchaseId: { type: 'number' },
    },
    required: ['purchaseId'],
};

// Роут для подтверждения покупки
businessRouter.post('/confirmPurchase', async (req, res) => {
    try {
        const { purchaseId } = req.body;

        const validationResult = schemaInspector.validate(confirmPurchaseSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Проверяем, существует ли покупка с указанным ID и статусом pending
        const [purchase] = await db.query('SELECT * FROM purchases WHERE id = ? AND status = "pending"', [purchaseId]);
        if (purchase.length === 0) {
            return res.status(404).json({ message: 'Покупка не найдена или уже подтверждена' });
        }

        // Получаем информацию о listing, чтобы проверить владельца
        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [purchase[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Проверяем, является ли текущий пользователь владельцем объявления
        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        // Обновляем статус покупки на completed
        await db.query('UPDATE purchases SET status = "completed" WHERE id = ?', [purchaseId]);

        // Обновляем баланс покупателя и владельца
        const purchasePrice = listing[0].salePrice; // Предполагается, что salePrice хранится в listings
        const buyerId = purchase[0].buyerId;
        const commission = purchasePrice * 0.1; // 10% комиссии
        const ownerId = listing[0].userId; // ID владельца книги

        // Обновляем баланс покупателя
        await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [purchasePrice, buyerId]);
        // Обновляем баланс владельца
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [purchasePrice - commission, ownerId]);
        // Обновляем баланс модератора (пользователь с id 0)
        await db.query('UPDATE users SET balance = balance + ? WHERE id = 0', [commission]);

        // Создаем записи о транзакциях
        const transactions = [
            {
                fromUserId: buyerId,
                toUserId: ownerId,
                amount: purchasePrice - commission,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: buyerId,
                toUserId: 0, // Модератор
                amount: commission,
                transactionType: 'user_to_service',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: 0, // Модератор
                toUserId: ownerId,
                amount: purchasePrice - commission,
                transactionType: 'service_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];

        // Вставляем все транзакции в базу данных
        for (const transaction of transactions) {
            await db.query('INSERT INTO transactions SET ?', transaction);
        }

        res.status(200).json({ message: 'Покупка успешно подтверждена и баланс обновлен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при подтверждении покупки' });
    }
});

// Роут для отправки запроса на возврат арендованной книги
businessRouter.post('/requestReturn', async (req, res) => {
    try {
        const { rentalId } = req.body;

        const validationResult = schemaInspector.validate({ type: 'object', properties: { rentalId: { type: 'number' } }, required: ['rentalId'] }, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Проверяем, существует ли аренда с указанным ID
        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        // Проверяем, является ли текущий пользователь арендатором
        if (rental[0].renterId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь арендатором этой книги' });
        }

        // Обновляем статус аренды на returnRequest
        await db.query('UPDATE rentals SET status = "returnRequest" WHERE id = ?', [rentalId]);

        res.status(200).json({ message: 'Запрос на возврат книги успешно отправлен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при отправке запроса на возврат книги' });
    }
});

// Роут для подтверждения возврата арендованной книги
businessRouter.post('/confirmReturn', async (req, res) => {
    try {
        const { rentalId } = req.body;

        const validationResult = schemaInspector.validate(confirmReturnSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        // Проверяем, существует ли аренда с указанным ID
        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        // Получаем информацию о listing, чтобы проверить владельца
        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Проверяем, является ли текущий пользователь владельцем объявления
        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        // Проверяем, истек ли срок аренды
        const currentDate = new Date();
        const endDate = new Date(rental[0].endDate);
        const renterId = rental[0].renterId;
        const depositAmount = listing[0].deposit; // Предполагается, что deposit хранится в listings

        if (currentDate > endDate) {
            // Если срок аренды истек, владелец может подтвердить возврат без запроса
            await db.query('UPDATE rentals SET status = "completed" WHERE id = ?', [rentalId]);

            // Списываем залог с арендатора
            await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [depositAmount, renterId]);
            await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [depositAmount, listing[0].userId]);

            // Создаем запись о транзакции за залог
            const transaction = {
                fromUserId: renterId,
                toUserId: listing[0].userId,
                amount: depositAmount,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await db.query('INSERT INTO transactions SET ?', transaction);

            // Удаляем запись о залоге
            await db.query('DELETE FROM deposits WHERE renterId = ? AND listingId = ? AND amount = ?', [renterId, rental[0].listingId, depositAmount]);
        } else {
            // Если срок аренды не истек, проверяем, отправил ли арендатор запрос на возврат
            if (rental[0].status !== 'returnRequest') {
                return res.status(400).json({ message: 'Книга может быть возвращена только по запросу арендатора' });
            }

            // Обновляем статус аренды на completed
            await db.query('UPDATE rentals SET status = "completed" WHERE id = ?', [rentalId]);

            // Возвращаем залог
            await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [depositAmount, renterId]);
            await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [depositAmount, listing[0].userId]);

            // Создаем запись о транзакции за возврат залога
            const transaction = {
                fromUserId: listing[0].userId,
                toUserId: renterId,
                amount: depositAmount,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await db.query('INSERT INTO transactions SET ?', transaction);

            // Удаляем запись о залоге
            await db.query('DELETE FROM deposits WHERE renterId = ? AND listingId = ? AND amount = ?', [renterId, rental[0].listingId, depositAmount]);
        }

        res.status(200).json({ message: 'Возврат книги успешно подтвержден' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при подтверждении возврата книги' });
    }
});

export default businessRouter;