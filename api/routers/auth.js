import express from 'express'
const authRouter = express.Router()
import passport from 'passport'
import bcrypt from "bcryptjs"
import { config } from 'dotenv';
import db from '../db.js';
import transporter from '../mail.js';
config();

authRouter.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }))


authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    });

authRouter.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ message: 'Некорректный адрес электронной почты' });
    }

    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
        }

        const hash = await bcrypt.hash(password, 10);
        
        const now = new Date();

        await db.query(
            'INSERT INTO users (email, password, verificated, name, city, avatarUrl, contactInfo, description, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [email, hash, false, email, "", "", "", "", "user", now, now]
        );

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query('INSERT INTO verifications (email, code) VALUES (?, ?)', [email, verificationCode]);

        const mailOptions = {
            from: transporter.options.auth.user,
            to: email,
            subject: 'Подтверждение регистрации',
            text: `Ваш код подтверждения: ${verificationCode}`
        };

        await transporter.sendMail(mailOptions);

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
        from: transporter.options.auth.user,
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
            return res.status(500).json({ message: 'Ошибка аутентификации' });
        }
        if (!user) {
            return res.status(401).json({ message: user });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка при входе' });
            }
            return res.status(200).json({ message: 'Успешный вход', user });
        });
    })(req, res, next);
});

authRouter.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

export default authRouter;