/// МАКЕТ ШАБЛОНА. НЕ РЕАЛИЗУЕТСЯ
/// МАКЕТ ШАБЛОНА. НЕ РЕАЛИЗУЕТСЯ
/// МАКЕТ ШАБЛОНА. НЕ РЕАЛИЗУЕТСЯ

import express from 'express'
const booksRouter = express.Router()
import { config } from 'dotenv';
import db from '../db.js';
import { checkPermissions, isAuthenticatedAndVerified } from '../middleware.js';
config();
import storage, {fileFilter} from '../multerConfig.js';
import multer from "multer";
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Максимальный размер файла 5MB
    fileFilter: fileFilter
}).array('photos', 5); // Максимум 5 файлов

const bookSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1 },
        author: { type: 'string', minLength: 1 },
        publicationYear: { type: 'number', optional: true },
        genre: { type: 'string', minLength: 1 },
        condition: { type: 'string', minLength: 1 },
        city: { type: 'string', minLength: 1 },
        photoUrls: { type: 'array', items: { type: 'string' } },
        description: { type: 'string', optional: true },
        userId: { type: 'number' },
    },
};

// GET: Получить все книги
booksRouter.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM books');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: JSON.stringify(err) });
    }
});

// GET: Получить книгу по ID
booksRouter.get('/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const [results] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Книга не найдена.' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении книги.' });
    }
});

// POST: Создать новую книгу
booksRouter.post('/', isAuthenticatedAndVerified, upload, async (req, res) => {
    const newBook = {
        title: req.body.title,
        author: req.body.author,
        publicationYear: req.body.publicationYear,
        genre: req.body.genre,
        condition: req.body.condition,
        city: req.body.city,
        photoUrls: JSON.stringify(req.files.map(file => file.path)), // Получаем пути к загруженным файлам
        description: req.body.description,
        userId: req.body.userId, // ID пользователя, создающего книгу
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        const [result] = await db.query('INSERT INTO books SET ?', newBook);
        res.status(201).json({ id: result.insertId, ...newBook });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при создании книги.' });
    }
});

// PUT: Обновить книгу по ID
booksRouter.put('/:id', isAuthenticatedAndVerified, checkPermissions, upload, async (req, res) => {

    const updatedBook = {
        title: req.body.title,
        author: req.body.author,
        publicationYear: req.body.publicationYear,
        genre: req.body.genre,
        condition: req.body.condition,
        city: req.body.city,
        photoUrls: JSON.stringify(req.files.map (file => file.path)), // Получаем пути к загруженным файлам
        description: req.body.description,
        userId: req.body.userId, // ID пользователя, обновляющего книгу
        updatedAt: new Date(),
    };

    try {
        const [result] = await db.query('UPDATE books SET ? WHERE id = ?', [updatedBook, bookId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Книга не найдена.' });
        }
        res.json({ message: 'Книга успешно обновлена.', ...updatedBook });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении книги.' });
    }
}); 

// DELETE: Удалить книгу по ID
booksRouter.delete('/:id', isAuthenticatedAndVerified, checkPermissions, async (req, res) => {
    const bookId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM books WHERE id = ?', [bookId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Книга не найдена.' });
        }
        res.json({ message: 'Книга успешно удалена.' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении книги.' });
    }
});

export default booksRouter;