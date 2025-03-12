import { app } from '../server.js';

app.use("/api", async (req, res) => {
    res.send({ 123: 123 })
})

export default app;