import express from 'express'
import { Order, Person, User, Review } from './models.js'
import inspector from "schema-inspector";
const apiRouter = express.Router();
import multer from "multer";
import fs from "fs"
import { resolve } from 'path';
import { overwriteMiddlewareResult } from 'mongoose';
import { isLoggined } from './middleware.js';
const storage = multer.diskStorage({
  destination: "files/",
  filename: function (req, file, callback) {
    callback(null, Date.now() + ".png");
  }
});
const upload = multer({ storage: storage })

const middleware = (req, res, next) => {
  next()
}

apiRouter.get('/', async (req, res) => {
  console.log(resolve(resolve(), "server", "api.html"))
  let html = fs.readFileSync(resolve(resolve(), "server", "api.html"), 'utf-8', (e,d)=>{console.log(d)})
  return res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
})


apiRouter.get('/persons', async (req, res) => {
  try {
    let persons = await Person.find()
    res.send(JSON.stringify(persons))
  }
  catch (error) {
    console.log(error)
  }
})

apiRouter.get('/personsMainPage', async (req, res) => {
  try {
    let persons = await Person.find({show: true});
    res.send(JSON.stringify(persons))
  }
  catch (error) {
    console.log(error)
  }
})


apiRouter.post('/persons', async (req, res) => {
  try {
    let persons = await Person.find({_id: {$in: req.body.persons}})
    res.send(JSON.stringify(persons))
  }
  catch (error) {
    console.log(error)
  }
})

apiRouter.get('/reviews/:id', async (req, res) => {
  try {
    let reviews = await Review.find({ person: req.params.id })
    res.send(JSON.stringify(reviews))
  }
  catch (error) {
    console.log(error)
  }
})

apiRouter.get('/person/:id', async (req, res) => {
  try {
    let person = await Person.findOne({ _id: req.params.id })
    res.send(JSON.stringify(person))
  }
  catch (error) {
    console.log(error)
  }
})

export default apiRouter