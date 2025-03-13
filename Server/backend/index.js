const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const authRouter = require('./routes/auth');
const visitorRouter = require('./routes/visitor');
const admit = require('./routes/admit');


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    console.log("reached here")
    try {
        console.log(process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });        
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};
connectDB();

app.use('/', authRouter);
app.use('/', visitorRouter);
app.use('/', admit);


app.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));
