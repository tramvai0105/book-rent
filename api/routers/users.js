/// МАКЕТ ШАБЛОНА. НЕ РЕАЛИЗУЕТСЯ

import multer from '../multerConfig.js';
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Максимальный размер файла 5MB
    fileFilter: fileFilter
}).single('avatar'); // Один файл

import express from 'express';
let usersRouter = express.Router();
import db from '../db.js';
import { isModerator } from '../middleware.js';

usersRouter(isModerator);

// GET: Получить всех пользователей
usersRouter.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM users');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении пользователей.' });
    }
});

// GET: Получить пользователя по ID
usersRouter.get('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [results] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (results.length === 0) {
            return res.status(404 ).json({ message: 'Пользователь не найден.' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении пользователя.' });
    }
});

// POST: Создать нового пользователя
usersRouter.post('/', upload, async (req, res) => {
    if (validationError) {
        return res.status(400).json({ message: 'Ошибка валидации данных.', errors: validationError });
    }

    const newUser  = {
        email: req.body.email,
        password: req.body.password,
        balance: req.body.balance,
        name: req.body.name,
        city: req.body.city,
        avatarUrl: req.file ? req.file.path : null, // Получаем путь к загруженному файлу
        contactInfo: req.body.contactInfo,
        description: req.body.description,
        role: req.body.role,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        const [result] = await db.query('INSERT INTO users SET ?', newUser );
        res.status(201).json({ id: result.insertId, ...newUser  });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при создании пользователя.' });
    }
});

// PUT: Обновить пользователя по ID
usersRouter.put('/:id', upload, async (req, res) => {
    const userId = req.params.id;
    if (validationError) {
        return res.status(400).json({ message: 'Ошибка валидации данных.', errors: validationError });
    }

    const updatedUser  = {
        email: req.body.email,
        password: req.body.password,
        balance: req.body.balance,
        name: req.body.name,
        city: req.body.city,
        avatarUrl: req.file ? req.file.path : null, // Получаем путь к загруженному файлу
        contactInfo: req.body.contactInfo,
        description: req.body.description,
        role: req.body.role,
        updatedAt: new Date(),
    };

    try {
        const [result] = await db.query('UPDATE users SET ? WHERE id = ?', [updatedUser , userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
        res.json({ message: 'Пользователь успешно обновлен.', ...updatedUser  });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении пользователя.' });
    }
});

// DELETE: Удалить пользователя по ID
usersRouter.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
        res.json({ message: 'Пользователь успешно удален.' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении пользователя.' });
    }
});

export default usersRouter;