import { User } from '../models.js'

export async function isLoggined(req, res, next) {
    let token = req.cookies["token"];
    try {
        if(!token){
            return res.status(404).json({message: "Not Authorized"})
        }
        let payload = jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.status(404).send("No payload")
        }
        let user = await User.findById(payload._id)
        req.body.id = payload._id
        next()
    } catch (error) {
        return res.status(404).json({message: "Auth error"});
    }
}

export async function isAdmin(req, res, next) {
    let token = req.cookies["token"];
    try {
        if(!token){
            return res.status(404).json({message: "Not Authorized"})
        }
        let payload = jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.status(404).send("No payload")
        }
        let user = await User.findById(payload._id)
        if (user.privileges) {
            console.log(req.body.id)
            next()
        } else {
            return res.status(404).json({message: "No privileges"})
        }
    } catch (error) {
        return res.status(404).json({message: "Error"});
    }
}

export async function checkUser(req, res, next) {
    try {
        let id = req.params.id;
        let token = req.cookies["token"];
        if(!token){
            return res.status(404).json({message: "Not Authorized"})
        }
        let payload = jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.status(404).send("No payload")
        }
        let user = await User.findById(payload._id)
        if (user.privileges || id == req.body.id) {
            next()
        } else {
            return res.status(404).json({message: "Not found"})
        }
    } catch (error) {
        return res.status(404).json({message: "Fake user"});
    }
} 