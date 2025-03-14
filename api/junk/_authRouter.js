import express from 'express'
import { User } from '../models.js'
import inspector from "schema-inspector";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const authRouter = express.Router()

const middleware = (req, res, next) => {
    next()
}

authRouter.use(middleware)

authRouter.get('/checktoken', async (req, res) => {
    let token = req.cookies["token"];
    if (!token) {
        return res.status(200).json({ message: false })
    }
    try {
        let payload = jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.status(200).json({ message: false })
        }
        const user = await User.findById(payload._id);
        return res.status(200).send({ message: { username: user.username, privileges: user.privileges, id: user._id, balance: user.balance, role: user.role, image: user.image } });
    } catch (error) {
        return res.status(200).send({ message: false });
    }
})

// authRouter.get('/registerkingpiglsey', async (req, res) => {
//     let password = bcrypt.hashSync("strongpassword", 10);
//     let user = new User({
//         username: "admin", password: password,
//         privileges: true,
//     });
//     await user.save();
//     res.json(200)
// })

authRouter.post('/register', async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            username: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Некорректные данные" });
    }
    let password = bcrypt.hashSync(req.body.password, 10);
    let checkUser = await User.findOne({ username: req.body.username });
    console.log(checkUser)
    if (checkUser) {
        return res.status(501).json({ message: "Имя уже занято" });
    }
    let user = new User({
        username: req.body.username, password: password,
        privileges: false,
        balance: 5000,
        role: "user",
        favorite: [],
        gender: ""
    });
    await user.save();
    return res.status(200).json({ message: "Пользователь успешно зарегистрирован" })
})

authRouter.post('/getPriviliges', async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            password: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Некорректные данные" });
    }
    let token = req.cookies["token"];
    if (!token) {
        return res.status(200).json({ message: "Не авторизован" })
    }
    let payload = jwt.verify(token, process.env.SECRET)
    if (!payload) {
        return res.status(200).json({ message: "Авторизируйтесь заново" })
    }
    if(req.body.password != process.env.MASTER){
        return res.status(200).json({ message: "Неверный мастер" })
    }
    const user = await User.findById(payload._id);
    user.privileges = true;
    await user.save();
    return res.status(200).json({ message: "Права получены" })
})

authRouter.post('/login', async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            username: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Некорректные данные" });
    }
    let user = await User.findOne({ username: req.body.username })
    if (!user) {
        return res.status(501).json({ message: "Пользователь не найден" });
    }
    let correct = await bcrypt.compare(req.body.password, user.password)
    if (!correct) {
        return res.status(401).json({ message: "Неправильный пароль" })
    }
    let token = jwt.sign(user.toJSON(), process.env.SECRET, { expiresIn: 86400 });
    return res.cookie("token", token, {expires: new Date(Date.now() + 86400 * 1000)}).status(200).json({ message: "Успешно авторизировано" })
})

authRouter.post('/cancel', async (req, res) => {
    return res.clearCookie("token").status(200).json({ message: "Выход из системы" })
})

export default authRouter