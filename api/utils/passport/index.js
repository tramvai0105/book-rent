import GoogleStrategy from 'passport-google-oauth20'
import LocalStrategy from 'passport-local';
import passport from 'passport'
import bcrypt from "bcryptjs"
import db from '../../db.js';

// Авторизует пользователя но сохранение в базе данных не реализовано
// passport.use(new GoogleStrategy({
//     clientID: process.env.VITE_AUTH_GOOGLE_ID,
//     clientSecret: process.env.VITE_AUTH_GOOGLE_SECRET,
//     callbackURL: "http://localhost:5173/auth/google/callback"
// },
//     function (accessToken, refreshToken, profile, cb) {
//         console.log(accessToken, refreshToken, profile);
//         cb(null, profile);
//     }
// ));

// Для регистрации по email\пароль
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const [results] = await db.query('SELECT * FROM users WHERE email = ?', [username]);
            if (results.length === 0) {
                return done(null, false, { message: 'Неверное имя пользователя.' });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Неверный пароль.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Внутрений метод паспорта складывает id пользователя в сессию
passport.serializeUser ((user, done) => {
    done(null, user.id);
});

// Внутрений метод паспорта извлекаем пользователя по id и исползуе дальше во всех методах через req.user
passport.deserializeUser (async (id, done) => {
    try {
        const results = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        let user = results[0][0]
        // Удаляем хэшированый пароль
        delete user.password
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;