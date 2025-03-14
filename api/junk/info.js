let a = `apiProtectedRouter.get('/', (req, res) => {
    res.json(200)
})

apiProtectedRouter.use(isLoggined)

apiProtectedRouter.get('/users', isAdmin, async (req, res) => {
    try {
        let users = await User.find()
        return res.send(JSON.stringify(users))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/users', isAdmin, async (req, res) => {
    try {
        let users = await User.find({ _id: { $in: req.body.users } });
        return res.send(JSON.stringify(users))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/user/:id', isAdmin, async (req, res) => {
    try {
        let users = await User.findOne({ _id: req.params.id })
        return res.send(JSON.stringify(users))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.put('/putUser', isAdmin, async (req, res) => {
    req.body.privileges = Number(req.body.privileges);
    req.body.balance = req.body.balance ? req.body.balance : 0;
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            username: { type: 'string', minLength: 5 },
            password: { type: "string", },
            privileges: { type: 'number', minLength: 1 },
            role: { type: "string", minLength: 1 },
            balance: { type: 'number', minLength: 1 },
            favorite: { type: 'string', minLength: 2 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        console.log(validated)
        return res.status(501).json({ message: "Неверные данные" });
    }
    // if (req.file
    //     && !(req.file.mimetype == "image/png"
    //         || req.file.mimetype == "image/jpg"
    //         || req.file.mimetype == "image/jpeg")) {
    //     fs.unlink(resolve(resolve(), "files", req.file.filename), (err) => err && console.error(err));
    //     return res.status(501).json({ message: "Неверный тип файла" });
    // }
    // if (req.file) {
    //     req.body.image = req.file.filename;
    // }
    req.body.favorite = (JSON.parse(req.body.favorite)).map(f => f.replace(/ /g, ''));
    console.log(req.body.favorite)
    req.body.password = req.body.password ? bcrypt.hashSync(req.body.password, 10) : req.body.password;
    req.body.privileges = Boolean(req.body.privileges);
    try {
        let person = await User.findOneAndUpdate({ _id: req.body._id }, req.body)
        // if (req.file) {
        //     fs.unlink(resolve(resolve(), "files", person.image), (err) => err && console.error(err));
        // }
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.put('/putUserImage', upload.single("files"), async (req, res) => {
    let token = req.cookies["token"];
    let payload = jwt.verify(token, process.env.SECRET)
    req.body.id = payload._id
    if (req.file
        && !(req.file.mimetype == "image/png"
            || req.file.mimetype == "image/jpg"
            || req.file.mimetype == "image/jpeg")) {
        fs.unlink(resolve(resolve(), "files", req.file.filename), (err) => err && console.error(err));
        return res.status(501).json({ message: "Неверный тип файла" });
    }
    if (req.file) {
        req.body.image = req.file.filename;
    }
    try {
        let user = await User.findById(req.body.id);
        if (req.file && user && user.image) {
            fs.unlink(resolve(resolve(), "files", person.image), (err) => err && console.error(err));
        }
        user.image = req.body.image;
        console.log(user)
        await user.save()
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})


apiProtectedRouter.put('/becomePerson', async (req, res) => {
    try {
        let user = await User.findOneAndUpdate({ _id: req.body.id }, {role: "person"})
        // if (req.file) {
        //     fs.unlink(resolve(resolve(), "files", person.image), (err) => err && console.error(err));
        // }
        return res.status(200).json({ message: "Права получены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/postUser', isAdmin, async (req, res) => {
    req.body.privileges = Number(req.body.privileges);
    delete req.body._id
    let validation = {
        type: 'object',
        properties: {
            username: { type: 'string', minLength: 5 },
            password: { type: "string", minLength: 5 },
            privileges: { type: 'number', minLength: 1 },
            role: { type: "string", minLength: 1 },
            balance: { type: 'number', minLength: 1 },
            favorite: { type: 'string', minLength: 2 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        console.log(validated)
        return res.status(501).json({ message: "Неверные данные" });
    }
    // if (req.file
    //     && !(req.file.mimetype == "image/png"
    //         || req.file.mimetype == "image/jpg"
    //         || req.file.mimetype == "image/jpeg")) {
    //     fs.unlink(resolve(resolve(), "files", req.file.filename), (err) => err && console.error(err));
    //     return res.status(501).json({ message: "Неверный тип файла" });
    // }
    // if (req.file) {
    //     req.body.image = req.file.filename;
    // }
    req.body.favorite = JSON.parse(req.body.favorite).replace(/ /g, '').split(",");
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    req.body.privileges = Boolean(req.body.privileges);
    req.body.balance = 5000;
    try {
        let user = new User(req.body);
        await user.save();
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.delete('/deleteUser', isAdmin, async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            _id: { type: 'string', minLength: 5 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        console.log(validated)
        return res.status(501).json({ message: "Не найдено?.." });
    }
    try {
        await User.deleteOne({ _id: req.body._id });
        return res.status(200).json({ message: "Данные удалены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/orders', isAdmin, async (req, res) => {
    try {
        let orders = await Order.find()
        return res.send(JSON.stringify(orders))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/requests/:id', checkUser, async (req, res) => {
    try {
        let persons = await Person.find({ username: req.params.id });
        let personsIds = persons.map(p => p._id);
        let orders = await Order.find({ person: { $in: personsIds } });
        let ordersUsers = orders.map(o => o.username);
        let users = await User.find({ _id: { $in: ordersUsers } });
        orders = orders.map(o => o.toObject());
        let orderPersonsIds = orders.map(o => o.person);
        let ordersPerson = await Person.find({ _id: { $in: orderPersonsIds } })
        for (let i = 0; i < orders.length; i++) {
            for (let j = 0; j < users.length; j++) {
                if (orders[i].username == users[j]._id) {
                    orders[i].user = { _id: users[j]._id, username: users[j].username };
                }
            }
            for (let j = 0; j < ordersPerson.length; j++) {
                if (orders[i].person == ordersPerson[j]._id) {
                    orders[i].person = ordersPerson[j];
                }
            }
        }
        return res.send(JSON.stringify(orders));
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/acceptOrder/:id', async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req.params.id });
        let person = await Person.findOne({ _id: order.person });
        console.log(order, person)
        if (req.body.id == person.username) {
            if (order.status != "new") {
                return res.status(501).json({ message: "Уже принят или отклонён" })
            }
            order.status = "current";
        } else {
            return res.status(501).json({ message: "Неверный пользователь." })
        }
        await order.save();
        return res.status(200).json({ message: "Заказ подтверждён." })
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/declineOrder/:id', async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req.params.id });
        let person = await Person.findOne({ _id: order.person });
        console.log(order, person)
        if (req.body.id == person.username) {
            if (order.status != "new") {
                return res.status(501).json({ message: "Уже принят или отклонён" })
            }
            order.status = "declined";
        } else {
            return res.status(501).json({ message: "Неверный пользователь." })
        }
        let user = await User.findById(order.username);
        user.balance += order.total;
        let payment = new Payment({ to: order.username, source: order._id, date: Date.now(), info: "order_decline", total: order.total })
        await payment.save()
        await user.save()
        await order.save();
        return res.status(200).json({ message: "Заказ подтверждён." })
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/finishOrder/:id', async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req.params.id });
        let person = await Person.findOne({ _id: order.person });
        console.log(order, person)
        if (req.body.id == person.username) {
            if (order.status != "current") {
                return res.status(501).json({ message: "Закац не в выполняется" })
            }
            order.status = "finished"
        } else {
            return res.status(501).json({ message: "Неверный пользователь." })
        }
        let user = await User.findById(person.username);
        //костыль
        if (!user.orderHistory) {
            user.orderHistory = [];
        }
        if (!person.orderHistory) {
            person.orderHistory = [];
        }
        user.orderHistory.push(order._id);
        person.orderHistory.push(order._id);
        user.balance += order.total;
        let payment = new Payment({ to: person.username, source: order._id, date: Date.now(), info: "order_accept", total: order.total })
        await payment.save()
        await person.save()
        await user.save()
        await order.save();
        return res.status(200).json({ message: "Заказ завершен." })
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/order/:id', isAdmin, async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req.params.id })
        return res.send(JSON.stringify(order))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/ordersByUser/:id', checkUser, async (req, res) => {
    try {
        let orders = await Order.find({ username: req.params.id })
        return res.send(JSON.stringify(orders))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/favorites', async (req, res) => {
    try {
        let user = await User.findById(req.body.id)
        return res.send(JSON.stringify(user.favorite))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/favoritesPersons', async (req, res) => {
    try {
        let user = await User.findById(req.body.id)
        user.favorite = user.favorite.filter(f => f.match(/^[0-9a-fA-F]{24}$/))
        let persons = await Person.find({ _id: { $in: user.favorite } })
        return res.send(JSON.stringify(persons))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/addFavorite/', async (req, res) => {
    try {
        let user = await User.findById(req.body.id)
        let validation = {
            type: 'object',
            properties: {
                person: { type: "string", minLength: 1 },
            },
        };
        let validated = inspector.validate(validation, req.body)
        if (!validated.valid) {
            return res.status(501).json({ message: "Неверные данные" });
        }
        if (user.favorite.filter(f => f == req.body.person).length == 0) {
            user.favorite.push(req.body.person);
        }
        await user.save();
        return res.status(200).json({ message: "Данные добавлены" });
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/removeFavorite/', async (req, res) => {
    try {
        let user = await User.findById(req.body.id)
        let validation = {
            type: 'object',
            properties: {
                person: { type: "string", minLength: 1 },
            },
        };
        let validated = inspector.validate(validation, req.body)
        if (!validated.valid) {
            return res.status(501).json({ message: "Неверные данные" });
        }
        if (user.favorite.filter(f => f == req.body.person).length > 0) {
            user.favorite = user.favorite.filter(f => f != req.body.person)
        }
        await user.save();
        return res.status(200).json({ message: "Данные добавлены" });
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/postOrder', isAdmin, async (req, res) => {
    delete req.body._id
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            user: { type: "string", minLength: 1 },
            person: { type: "string", minLength: 1 },
            status: { type: "string", minLength: 1 },
            total: { type: 'number', minLength: 1 },
            address: { type: "string", minLength: 1 },
            details: { type: "string", minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    req.body.date = Date.now();
    try {
        await (new Order(req.body)).save()
        return res.status(200).json({ message: "Данные добавлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.put('/putOrder', isAdmin, async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            user: { type: "string", minLength: 1 },
            person: { type: "string", minLength: 1 },
            status: { type: "string", minLength: 1 },
            total: { type: 'number', minLength: 1 },
            address: { type: "string", minLength: 1 },
            details: { type: "string", minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    try {
        await Order.findOneAndUpdate({ _id: req.body._id }, req.body)
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/makeOrder', async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            id: { type: "string", minLength: 1 },
            person: { type: "string", minLength: 1 },
            hours: { type: 'number', minLength: 1, gt: 0, lt: 9 },
            address: { type: "string", minLength: 1 },
            details: { type: "string", minLength: 1 },
            orderDate: { type: "number", minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        console.log(validated)
        return res.status(501).json({ message: "Неверные данные" });
    }
    let person = await Person.findById(req.body.person);
    let orders = await Order.find({ username: req.body.id })
    if (orders && orders.filter(o => o.person == person._id && o.status !== "finished" && o.status !== "declined").length > 0) {
        return res.status(501).json({ message: "Уже заказан" });
    }
    if (!person) {
        return res.status(501).json({ message: "Ошибка при выборе пользователя" });
    }
    req.body.total = Math.floor(req.body.hours) === 8 ? person.bigPrice : Math.floor(req.body.hours) * person.smallPrice
    req.body.status = "new";
    req.body.creatDate = Date.now();
    req.body.username = req.body.id;
    let order = new Order(req.body);
    let user = await User.findById(req.body.id);
    if (user.balance < req.body.total) {
        return res.status(501).json({ message: "Недостаточно средств" });
    }
    user.balance -= req.body.total;
    let payment = new Payment({ to: order._id, source: req.body.id, date: Date.now(), info: "order_from", total: req.body.total })
    try {
        await order.save();
        await payment.save();
        await user.save();
        return res.status(200).json({ message: "Заказ добавлен" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.get('/personsByUser/', async (req, res) => {
    try {
        let persons = await Person.find({ username: req.body.id })
        return res.send(JSON.stringify(persons))
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.put('/putPerson', isAdmin, upload.single("files"), async (req, res) => {
    let token = req.cookies["token"];
    let payload = jwt.verify(token, process.env.SECRET)
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            name: { type: 'string', minLength: 5 },
            smallPrice: { type: 'number', minLength: 1 },
            category: { type: 'string', minLength: 1 },
            bigPrice: { type: 'number', minLength: 1 },
            body: { type: 'number', minLength: 1 },
            fist: { type: 'number', minLength: 1 },
            lips: { type: 'number', minLength: 1 },
            description: { type: 'string', minLength: 5 },
            image: { type: 'string', minLength: 5 },
            gender: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    if (req.file
        && !(req.file.mimetype == "image/png"
            || req.file.mimetype == "image/jpg"
            || req.file.mimetype == "image/jpeg")) {
        fs.unlink(resolve(resolve(), "files", req.file.filename), (err) => err && console.error(err));
        return res.status(501).json({ message: "Неверный тип файла" });
    }
    if (req.file) {
        req.body.image = req.file.filename;
    }
    req.body.username = payload._id
    try {
        let person = await Person.findOneAndUpdate({ _id: req.body._id }, req.body)
        if (req.file) {
            fs.unlink(resolve(resolve(), "files", person.image), (err) => err && console.error(err));
        }
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.put('/putPersonByUser', upload.single("files"), async (req, res) => {
    let token = req.cookies["token"];
    let payload = jwt.verify(token, process.env.SECRET)
    let person = await Person.findById(req.body._id);
    console.log(payload._id, person.username)
    if (payload._id != person.username) {
        return res.status(501).json({ message: "Нет доступа к запросу" });
    }
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            name: { type: 'string', minLength: 5 },
            smallPrice: { type: 'number', minLength: 1 },
            category: { type: 'string', minLength: 1 },
            bigPrice: { type: 'number', minLength: 1 },
            body: { type: 'number', minLength: 1 },
            fist: { type: 'number', minLength: 1 },
            lips: { type: 'number', minLength: 1 },
            description: { type: 'string', minLength: 5 },
            image: { type: 'string', minLength: 5 },
            gender: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    if (req.file
        && !(req.file.mimetype == "image/png"
            || req.file.mimetype == "image/jpg"
            || req.file.mimetype == "image/jpeg")) {
        fs.unlink(resolve(resolve(), "files", req.file.filename), (err) => err && console.error(err));
        return res.status(501).json({ message: "Неверный тип файла" });
    }
    if (req.file) {
        req.body.image = req.file.filename;
    }
    req.body.username = payload._id
    try {
        await Person.findOneAndUpdate({ _id: req.body._id }, req.body)
        await person.save();
        if (req.file) {
            fs.unlink(resolve(resolve(), "files", person.image), (err) => err && console.error(err));
        }
        return res.status(200).json({ message: "Данные обновлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/postPerson', isAdmin, upload.single("files"), async (req, res) => {
    delete req.body._id
    let token = req.cookies["token"];
    let payload = jwt.verify(token, process.env.SECRET)
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            name: { type: 'string', minLength: 5 },
            smallPrice: { type: 'number', minLength: 1 },
            bigPrice: { type: 'number', minLength: 1 },
            category: { type: 'string', minLength: 1 },
            body: { type: 'number', minLength: 1 },
            fist: { type: 'number', minLength: 1 },
            lips: { type: 'number', minLength: 1 },
            description: { type: 'string', minLength: 5 },
            image: { type: 'string', minLength: 5 },
            gender: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    if (!req.file) {
        return res.status(501).json({ message: "Изображение не найдено" })
    }
    if (req.file
        && !(req.file.mimetype == "image/png"
            || req.file.mimetype == "image/jpg"
            || req.file.mimetype == "image/jpeg")) {
        fs.unlink(resolve(resolve(), "public", req.file.filename), (err) => err && console.error(err));
        return res.status(501).json({ message: "Неверный тип файла" });
    }
    if (req.file) {
        req.body.image = req.file.filename;
    }
    if (req.body.bigPrice === 0) {
        req.body.bigPrice = req.body.smallPrice * 8 * 0.9;
    }
    req.body.rating = 0;
    req.body.reviews = [];
    req.body.username = payload._id
    try {
        await (new Person(req.body)).save()
        return res.status(200).json({ message: "Данные добавлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/postPersonByUser', upload.single("files"), async (req, res) => {
    delete req.body._id
    let token = req.cookies["token"];
    let payload = jwt.verify(token, process.env.SECRET)
    let validation = {
        type: 'object',
        properties: {
            _id: { type: "string", minLength: 1 },
            name: { type: 'string', minLength: 5 },
            smallPrice: { type: 'number', minLength: 1 },
            bigPrice: { type: 'number', minLength: 1 },
            category: { type: 'string', minLength: 1 },
            description: { type: 'string', minLength: 5 },
            image: { type: 'string', minLength: 5 },
            gender: { type: 'string', minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Неверные данные" });
    }
    let persons = await Person.find({name: req.body.name});
    if(persons && persons.length > 0){
        return res.status(501).json({ message: "Это имя уже занято" })
    }
    if (!req.file) {
        return res.status(501).json({ message: "Изображение не найдено" })
    }
    if (req.file
        && !(req.file.mimetype == "image/png"
            || req.file.mimetype == "image/jpg"
            || req.file.mimetype == "image/jpeg")) {
        fs.unlink(resolve(resolve(), "public", req.file.filename), (err) => err && console.error(err));
        return res.status(501).json({ message: "Неверный тип файла" });
    }
    if (req.file) {
        req.body.image = req.file.filename;
    }
    if (req.body.bigPrice === 0) {
        req.body.bigPrice = req.body.smallPrice * 8 * 0.9;
    }
    req.body.rating = 0;
    req.body.reviews = [];
    req.body.username = payload._id
    req.body.body = Math.floor(Math.random() * (6 - 1)) + 1
    req.body.lips = Math.floor(Math.random() * (6 - 1)) + 1
    req.body.fist = Math.floor(Math.random() * (6 - 1)) + 1
    req.body.show = false;
    req.body.orderHistory = [];
    try {
        await (new Person(req.body)).save()
        return res.status(200).json({ message: "Данные добавлены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.delete('/deletePerson', isAdmin, async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            _id: { type: 'string', minLength: 5 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        return res.status(501).json({ message: "Не найдено?.." });
    }
    console.log(req.body)
    try {
        await Person.deleteOne({ _id: req.body._id });
        return res.status(200).json({ message: "Данные удалены" });
    } catch (error) {
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/addBalance/', async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.body.id });
        if (req.body.total > 500) {
            return res.status(501).json({ message: "ТЫ ЗАЕБАЛ А! ГОВОРЮ ДОХУЯ!" })
        }
        user.balance += req.body.total;
        let payment = new Payment({ to: req.body.id, source: "addBalance", date: Date.now(), info: "", total: req.body.total });
        await payment.save();
        await user.save();
        return res.status(200).json({ message: "Баланс пополнен." })
    }
    catch (error) {
        console.log(error)
        return res.status(501).json({ message: error });
    }
})

apiProtectedRouter.post('/makeReview', async (req, res) => {
    let validation = {
        type: 'object',
        properties: {
            person: { type: "string", minLength: 1 },
            text: { type: "string", minLength: 1 },
            rating: { type: "number" },
            order: { type: "string", minLength: 1 },
        },
    };
    let validated = inspector.validate(validation, req.body)
    if (!validated.valid) {
        console.log(validated)
        return res.status(501).json({ message: "Неверные данные" });
    }
    if (req.body.rating > 5 || req.body.rating < 1) {
        return res.status(501).json({ message: "Неверная оценка" });
    }
    let order = await Order.findById(req.body.order)
    order.review = true;
    await order.save();
    req.body.username = req.body.id
    if (order.username != req.body.username || order.person != req.body.person) {
        return res.status(501).json({ message: "Несовпадение пользователей" });
    }
    let oldReview = await Review.find({order: order._id})
    if (oldReview.length > 0) {
        return res.status(501).json({ message: "Отзыв уже оставлен" });
    }
    req.body.date = Date.now();
    try {
        let review = new Review(req.body);
        await review.save();
        let personQ = await Person.findById(req.body.person);
        let person = personQ.toObject();
        person.reviews.push(review._id.toString());
        person.reviews = person.reviews.filter(r => r.length > 0);
        let reviews = await Review.find({ _id: { $in: person.reviews } });
        let rating = 0;
        if (reviews.length == 0) {
            rating = 0
        } else {
            let sum = 0
            for (let i = 0; i < reviews.length; i++) {
                console.log(reviews[i])
                sum += Number(reviews[i].rating)
            }
            rating = sum / reviews.length;
        }
        personQ.rating = rating;
        personQ.reviews = person.reviews;
        await personQ.save();
        return res.status(200).json({ message: "Отзыв добавлен" });
    } catch (error) {
        console.log(error)
        return res.status(501).json({ message: JSON.stringify(error) });
    }
})`

// let regex = /(?<=apiProtectedRouter.)(.*)(?=\')/g

// let found = a.match(regex);

// let info = found.map(f=> [f, ""]);

let apiInfo = [
    ["get('/", 'Краткое описание апи(будет дополняться(нет))'],
    ["get('/users", 'Список пользователей.'],
    ["post('/users", 'Конкретные пользователи из массива'],
    ["get('/user/:id", 'Конкретный пользователь'],
    ["put('/putUser", 'Изменить пользователя'],
    ["put('/putUserImage", 'Установить изображение пользователя'],
    ["put('/becomePerson", 'Стать участником'],
    ["post('/postUser", 'Добавить пользователя'],
    ["delete('/deleteUser", 'Удалить пользователя'],
    ["get('/orders", 'Получить заказы'],
    ["get('/requests/:id", 'Заявки по айди пользователя'],
    ["post('/acceptOrder/:id", 'Принять заказ'],
    ["post('/declineOrder/:id", 'Отменить заказ'],
    ["post('/finishOrder/:id", 'Завершить заказ'],
    ["get('/order/:id", 'Заказ по айди'],
    ["get('/ordersByUser/:id", 'Заказы пользователя'],
    ["get('/favorites", 'Избранное только айди'],
    ["get('/favoritesPersons", 'Избранное полностью'],
    ["post('/addFavorite/", 'Добавить избранное'],
    ["post('/removeFavorite/", 'Удалить избранное'],
    ["post('/postOrder", 'Добавить заказ'],
    ["put('/putOrder", 'Изменить заказ'],
    ["post('/makeOrder", 'Сделать заказ(для пользователей)'],
    ["get('/personsByUser/", 'Профили во владении пользователя'],
    ["put('/putPerson", 'Изменить профиль'],
    ["put('/putPersonByUser", 'Изменить профиль(для польз)'],
    ["post('/postPerson", 'Добавить профиль'],
    ["post('/postPersonByUser", 'Добавить профиль(для польз)'],
    ["delete('/deletePerson", 'Удалить профиль'],
    ["post('/addBalance/", 'Добавить свой баланс'],
    ["post('/makeReview", 'Сделать отзыв']
]

document.body.onload = () => {

    let body = document.querySelector("body")

    let divs = apiInfo.map(info => {
        let newDiv = document.createElement("div")
        newDiv.innerHTML = info[0] + " - " + info[1];
        return newDiv;
    })

    divs.map(d=>body.appendChild(d));

    console.log(divs)
}

// console.log(apiInfo)

