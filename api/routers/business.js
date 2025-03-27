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

// Роут для добавления книги
businessRouter.put('/editBook', upload.array('photos'), async (req, res) => {
    try {
        const { listingId, title, author, publicationYear, genre, wealth, address, phoneNumber, description, interactionType, rentPricePerMonth, deposit, salePrice } = req.body;

        const [listingRows] = await db.query('SELECT l.userId, b.id AS bookId, l.status, b.photoUrls FROM listings l JOIN books b ON l.bookId = b.id WHERE l.id = ?', [listingId]);

        if (listingRows.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено.' });
        }

        const listing = listingRows[0];

        if (listing.userId !== req.user.id) {
            return res.status(403).json({ message: 'У вас нет прав на редактирование этого объявления.' });
        }

        if (listing.status === 'pending' || listing.status === 'closed') {
            return res.status(400).json({ message: 'Нельзя редактировать объявление с статусом "pending" или "closed".' });
        }

        await db.query('DELETE FROM Moderations WHERE listingId = ?', [listingId]);

        let photoUrls;
        if (req.files && req.files.length > 0) {
            photoUrls = JSON.stringify(req.files.map(file => file.path));
        } else {
            photoUrls = JSON.stringify(listing.photoUrls);
        }

        const updatedBook = {
            title,
            author,
            publicationYear,
            genre,
            photoUrls,
            description,
            wealth,
            updatedAt: new Date(),
        };

        await db.query('UPDATE books SET ? WHERE id = ?', [updatedBook, listing.bookId]);

        const updatedListing = {
            interactionType,
            rentPricePerMonth,
            salePrice,
            deposit,
            phoneNumber,
            address,
            city: req.user.city,
            status: 'pending',
            updatedAt: new Date(),
        };

        await db.query('UPDATE listings SET ? WHERE id = ?', [updatedListing, listingId]);

        res.status(200).json({ message: 'Книга и листинг успешно обновлены' });
    } catch (error) {
        console.error('Ошибка при обновлении книги:', error);
        res.status(500).json({ message: 'Произошла ошибка при обновлении книги' });
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

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Получаем информацию о пользователе
        const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const rentalPrice = Number(listing[0].rentPricePerMonth); // Предполагается, что цена аренды хранится в поле rentPrice
        const deposit = Number(listing[0].deposit); // Предполагается, что залог хранится в поле deposit
        const totalAmount = rentalPrice + deposit; // Общая сумма для заморозки
        if (user[0].balance < totalAmount) {
            return res.status(400).json({ message: 'Недостаточно средств для аренды книги' });
        }

        // Обновляем баланс пользователя: вычитаем сумму из баланса и добавляем в замороженный баланс
        await db.query('UPDATE users SET balance = balance - ?, frozenBalance = frozenBalance + ? WHERE id = ?', [totalAmount, totalAmount, req.user.id]);

        const rental = {
            listingId,
            renterId: req.user.id,
            startDate: new Date(),
            endDate: null,
            status: 'pending',
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

        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ? AND status = "pending"', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена или уже подтверждена' });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        const [renter] = await db.query('SELECT * FROM users WHERE id = ?', [rental[0].renterId]);
        if (renter.length === 0) {
            return res.status(404).json({ message: 'Арендатор не найден' });
        }

        const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // Аренда на месяц
        await db.query('UPDATE rentals SET status = "active", endDate = ? WHERE id = ?', [endDate, rentalId]);
        await db.query('UPDATE listings SET status = "process" WHERE id = ?', [rental[0].listingId]);

        const rentPrice = listing[0].rentPricePerMonth;
        const commission = rentPrice * 0.1;
        const ownerId = listing[0].userId;
        const depositAmount = listing[0].deposit;

        // Списываем цену аренды с замороженного баланса арендатора
        await db.query('UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?', [rentPrice, rental[0].renterId]);
        // Обновляем баланс владельца
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [rentPrice - commission, ownerId]);
        // Обновляем баланс модератора (пользователь с id 0)
        await db.query('UPDATE users SET balance = balance + ? WHERE id = 1', [commission]);

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
                toUserId: ownerId,
                amount: rentPrice - commission,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: rental[0].renterId,
                toUserId: 1, // Модератор
                amount: commission,
                transactionType: 'user_to_service',
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

        // Получаем информацию о пользователе
        const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const purchasePrice = Number(listing[0].salePrice); // Предполагается, что цена продажи книги хранится в поле salePrice
        if (user[0].balance < purchasePrice) {
            return res.status(400).json({ message: 'Недостаточно средств для покупки книги' });
        }

        // Обновляем баланс пользователя: вычитаем сумму из баланса и добавляем в замороженный баланс
        await db.query('UPDATE users SET balance = balance - ?, frozenBalance = frozenBalance + ? WHERE id = ?', [purchasePrice, purchasePrice, req.user.id]);

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

        const [purchase] = await db.query('SELECT * FROM purchases WHERE id = ? AND status = "pending"', [purchaseId]);
        if (purchase.length === 0) {
            return res.status(404).json({ message: 'Покупка не найдена или уже подтверждена' });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [purchase[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        await db.query('UPDATE purchases SET status = "completed" WHERE id = ?', [purchaseId]);

        const purchasePrice = listing[0].salePrice;
        const buyerId = purchase[0].buyerId;
        const commission = purchasePrice * 0.1; // 10% комиссии
        const ownerId = listing[0].userId;

        // Обновляем замороженный баланс покупателя
        await db.query('UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?', [purchasePrice, buyerId]);
        // Обновляем баланс владельца
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [purchasePrice - commission, ownerId]);
        // Обновляем баланс модератора (пользователь с id 1)
        await db.query('UPDATE users SET balance = balance + ? WHERE id = 1', [commission]);

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
                toUserId: 1, // Модератор
                amount: commission,
                transactionType: 'user_to_service',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: 1, // Модератор
                toUserId: ownerId,
                amount: purchasePrice - commission,
                transactionType: 'service_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];

        for (const transaction of transactions) {
            await db.query('INSERT INTO transactions SET ?', transaction);
        }

        res.status(200).json({ message: 'Покупка успешно подтверждена и баланс обновлен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при подтверждении покупки' });
    }
});

businessRouter.post("/requestExtend", async (req, res) => {
    const { rentalId } = req.body; // Получаем ID аренды из запроса
    const userId = req.user.id; // Получаем ID пользователя из запроса

    try {
        // Проверяем, существует ли аренда и принадлежит ли она пользователю
        const [rental] = await db.query(`
            SELECT * FROM Rentals 
            WHERE id = ? AND renterId = ?
        `, [rentalId, userId]);

        if (rental.length === 0) {
            return res.status(404).json({ message: "Аренда не найдена или вы не имеете права на продление." });
        }

        // Получаем текущую дату окончания аренды
        const currentEndDate = new Date(rental[0].endDate);
        // Устанавливаем новую дату окончания на месяц вперед
        const newEndDate = new Date(currentEndDate.setMonth(currentEndDate.getMonth() + 1));

        // Обновляем дату окончания аренды и устанавливаем статус в 'extendRequest'
        await db.query(`
            UPDATE Rentals 
            SET endDate = ?, status = 'extendRequest' 
            WHERE id = ?
        `, [newEndDate, rentalId]);

        res.json({ message: "Запрос на продление аренды успешно отправлен." });
    } catch (error) {
        console.error("Ошибка при запросе на продление аренды:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
});

businessRouter.post("/confirmExtend", async (req, res) => {
    const { rentalId } = req.body; // Получаем ID аренды из запроса
    const userId = req.user.id; // Получаем ID пользователя из запроса

    try {
        // Проверяем, существует ли аренда
        const [rental] = await db.query(`
            SELECT * FROM Rentals 
            WHERE id = ?
        `, [rentalId]);

        if (rental.length === 0) {
            return res.status(404).json({ message: "Аренда не найдена." });
        }

        // Проверяем, что статус аренды 'extendRequest'
        if (rental[0].status !== 'extendRequest') {
            return res.status(400).json({ message: "Запрос на продление не найден." });
        }

        // Проверяем, является ли текущий пользователь арендатором
        if (rental[0].renterId !== userId) {
            return res.status(403).json({ message: "Вы не имеете права подтверждать продление этой аренды." });
        }

        const listingId = rental[0].listingId; // Получаем ID листинга из аренды

        // Получаем информацию о листинге, чтобы получить цену аренды и ID владельца
        const [listing] = await db.query(`
            SELECT userId, rentPricePerMonth FROM Listings 
            WHERE id = ?
        `, [listingId]);

        if (listing.length === 0) {
            return res.status(404).json({ message: "Листинг не найден." });
        }

        const rentPrice = listing[0].rentPricePerMonth;
        const ownerId = rental[0].listingId;

        // Списываем сумму аренды с замороженного баланса арендатора
        await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [rentPrice, userId]);

        // Обновляем баланс владельца
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [rentPrice * 0.9, ownerId]);

        // Обновляем баланс модератора (пользователь с id 1)
        await db.query('UPDATE users SET balance = balance + ? WHERE id = 1', [rentPrice * 0.1]);

        // Создаем записи о транзакциях
        const transactions = [
            {
                fromUserId: userId,
                toUserId: ownerId,
                amount: rentPrice * 0.9,
                transactionType: 'user_to_user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                fromUserId: userId,
                toUserId: 1,
                amount: rentPrice * 0.1,
                transactionType: 'user_to_service',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];

        for (const transaction of transactions) {
            await db.query('INSERT INTO transactions SET ?', transaction);
        }

        await db.query('UPDATE Rentals SET status = "active" WHERE id = ?', [rentalId]);

        res.json({ message: "Продление аренды успешно подтверждено." });
    } catch (error) {
        console.error("Ошибка при подтверждении продления аренды:", error);
        res.status(500).json({ message: JSON.stringify(error) });
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

const confirmReturnSchema = {
    type: 'object',
    properties: {
        rentalId: { type: 'number' },
    },
    required: ['rentalId'],
};

// Роут для подтверждения возврата арендованной книги
businessRouter.post('/confirmReturn', async (req, res) => {
    try {
        const { rentalId } = req.body;

        const validationResult = schemaInspector.validate(confirmReturnSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        if (rental[0].status === 'dispute') {
            return res.status(403).json({ message: 'Возврат не может быть подтвержден, пока статус аренды - диспут.' });
        }

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [rental[0].listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        if (listing[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь владельцем этого объявления' });
        }

        const currentDate = new Date();
        const endDate = new Date(rental[0].endDate);
        const renterId = rental[0].renterId;
        const depositAmount = listing[0].deposit;

        if (currentDate > endDate) {
            // Если срок аренды истек, владелец может подтвердить возврат без запроса
            await db.query('UPDATE rentals SET endDate = ?, status = "completed" WHERE id = ?', [currentDate, rentalId]);
            await db.query('UPDATE listings SET status = "closed" WHERE id = ?', [rental[0].listingId]);

            // Списываем залог с замороженного баланса арендатора
            await db.query('UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?', [depositAmount, renterId]);
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
            await db.query('UPDATE rentals SET endDate = ?, status = "completed" WHERE id = ?', [currentDate, rentalId]);
            await db.query('UPDATE listings SET status = "closed" WHERE id = ?', [rental[0].listingId]);

            // Возвращаем залог с замороженного баланса владельца
            await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [depositAmount, renterId]);
            await db.query('UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?', [depositAmount, listing[0].userId]);

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
        res.status(500).json({ message: JSON.stringify(error) });
    }
});

const createDisputeSchema = {
    type: 'object',
    properties: {
        rentalId: { type: 'integer', min: 1, required: true },
        description: { type: 'string', min: 10, max: 500, required: true },
    },
    required: ['rentalId', 'description'],
};

businessRouter.post('/createDispute', upload.array('photos'), async (req, res) => {
    try {
        const { rentalId, description, images } = req.body;
        const userId = req.user.id;

        const validationResult = schemaInspector.validate(createDisputeSchema, req.body);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.format() });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Необходимо загрузить хотя бы одно фото.' });
        }

        const [existingDispute] = await db.query('SELECT * FROM Disputes WHERE rentalId = ?', [rentalId]);
        if (existingDispute.length > 0) {
            return res.status(400).json({ message: 'Диспут уже создан для этой аренды.' });
        }

        const [rental] = await db.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);
        if (rental.length === 0) {
            return res.status(404).json({ message: 'Аренда не найдена' });
        }

        const renterId = rental[0].renterId;
        const listingId = rental[0].listingId;

        const [listing] = await db.query('SELECT * FROM listings WHERE id = ?', [listingId]);
        if (listing.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        const sellerId = listing[0].userId;
        if (userId !== sellerId) {
            return res.status(403).json({ message: 'Доступ запрещен: вы не являетесь арендодателем этого объявления' });
        }
        console.log(sellerId, renterId)
        let [chatId] = await db.query(`SELECT id FROM Chats WHERE (sellerId = ? AND buyerId = ?) AND listingId = ?`, [sellerId, renterId, listingId]);
        console.log(chatId);
        if (chatId.length === 0) {
            const [result] = await db.query('INSERT INTO Chats (sellerId, buyerId, listingId) VALUES (?, ?, ?)', [sellerId, renterId, listingId]);
            chatId = result.insertId;
        } else {
            chatId = chatId[0].id;
        }

        const dispute = {
            rentalId,
            moderatorId: 1,
            description,
            chatId: chatId,
            images: JSON.stringify(req.files.map(file => file.filename)),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.query('INSERT INTO Disputes SET ?', dispute);

        await db.query('UPDATE rentals SET status = ? WHERE id = ?', ['dispute', rentalId]);

        res.status(201).json({ message: 'Диспут успешно создан' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: JSON.stringify(error) });
    }
});

export default businessRouter;