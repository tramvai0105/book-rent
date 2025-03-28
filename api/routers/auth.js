import express from 'express'
const authRouter = express.Router()
import passport from 'passport'
import bcrypt from "bcryptjs"
import { config } from 'dotenv';
import db from '../db.js';
import transporter from '../mail.js';
import schemaInspector from 'schema-inspector';
config();

/// ДЛЯ OAuTH Google
// authRouter.get('/google',
//     passport.authenticate('google', { scope: ['profile', 'email'] }))


// authRouter.get('/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     function (req, res) {
//         res.redirect('/');
//     });

// Выход из системы
authRouter.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

const registrationSchema = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 }, // Минимальная длина пароля
        contactInfo: { type: 'string', minLength: 1 }, // Обязательно
        city: { type: 'string', minLength: 1 }, // Обязательно
    },
    required: ['email', 'password', 'contactInfo', 'city'], // Все поля обязательны
};

// Регистрация
authRouter.post('/register', async (req, res) => {
    const { email, password, contactInfo, city } = req.body;

    // Валидация данных
    const validationResult = schemaInspector.validate(registrationSchema, req.body);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.format() });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ message: 'Некорректный адрес электронной почты' });
    }

    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
        }

        // Хэшируем пароль
        const hash = await bcrypt.hash(password, 10);
        
        const now = new Date();

        await db.query(
            'INSERT INTO users (email, password, verificated, name, city, avatarUrl, contactInfo, description, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [email, hash, false, email, city, "avatarDefault.jpg", contactInfo, "", "user", now, now]
        );

        // Код верификации
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query('INSERT INTO verifications (email, code) VALUES (?, ?)', [email, verificationCode]);

        const mailOptions = {
            from: transporter.options.sender, // Sender указываеся в инициализации транспортера
            to: email,
            subject: 'Подтверждение регистрации',
            text: `Ваш код подтверждения: ${verificationCode}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            // Если отправка не удалась, удаляем пользователя и запись верификации
            await db.query('DELETE FROM users WHERE email = ?', [email]);
            await db.query('DELETE FROM verifications WHERE email = ?', [email]);

            console.log('Ошибка при отправке письма:', mailError);
            return res.status(500).json({ message: 'Ошибка при отправке письма. Пользователь не был зарегистрирован.' });
        }

        // Успешный ответ
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован. Проверьте вашу почту для подтверждения.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Ошибка при регистрации' });
    }
});

authRouter.post('/retriveSend', async (req, res) => {
    const { email } = req.body;

    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
        return res.status(400).json({ message: 'Этот email не зарегистрирован'});
    }

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    await db.query('UPDATE users SET recovery_code = ? WHERE email = ?', [recoveryCode, email]);

    const mailOptions = {
        from: transporter.options.sender,  // Sender указываеся в инициализации транспортера
        to: email,
        subject: 'Код восстановления',
        text: `Ваш код восстановления: ${recoveryCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Ошибка при отправке кода восстановления'});
        }
        res.status(200).json({ message: 'Код восстановления отправлен на ваш email'});
    });
});

authRouter.post('/retriveAccept', async (req, res) => {
    const { email, recoveryCode, newPassword } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND recovery_code = ?', [email, recoveryCode]);

    if (rows.length > 0) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE users SET password = ?, recovery_code = NULL WHERE email = ?', [hashedPassword, email]);

        res.status(200).json({ message: 'Пароль успешно обновлен'});
    } else {
        res.status(400).json({ message: 'Неверный код восстановления'});
    }
});

authRouter.post('/verificate', async (req, res) => {
    const { confirmationCode } = req.body;
    const email = req.user.email;

    try {
        // Проверка кода подтверждения в таблице verification
        const [verificationResults] = await db.query('SELECT * FROM verifications WHERE email = ? AND code = ?', [email, confirmationCode]);

        if (verificationResults.length === 0) {
            return res.status(400).json({ message: 'Неверный код подтверждения.' });
        }

        // Если код подтверждения верный, обновляем статус пользователя в таблице users
        await db.query('UPDATE users SET verificated = ? WHERE email = ?', [true, email]);

        // Удаляем запись из таблицы verification (по желанию)
        await db.query('DELETE FROM verifications WHERE email = ?', [email]);

        return res.status(200).json({ message: 'Код подтверждения принят. Ваш аккаунт активирован.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Ошибка при подтверждении кода.' });
    }
});

authRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: err });
        }
        if (!user) {
            return res.status(401).json({ message: user });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Успешный вход', user });
        });
    })(req, res, next);
});


// Служебный метод для запроса информации профиля
authRouter.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

export default authRouter;