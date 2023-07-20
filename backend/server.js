require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 5000;

// Connessione a MongoDB
connectDB();

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware per gestire il formato dati urlencoded
app.use(express.urlencoded({ extended: false }));

// Built-in middleware per il json 
app.use(express.json());

// Middleware per fornire file statici
app.use('/', express.static(path.join(__dirname, '/public')));

// ROTTE

// Root
app.use('/', require('./routes/rootRoute'));

// Rotte per fornire i dati dei sensori
app.use('/getBMPData', require('./routes/getBMPData'));
app.use('/getBHData', require('./routes/getBHData'));

// Rotte per memorizzare i nuovi dati dei sensori
app.use('/storeBMPData', require('./routes/storeBMPData'));
app.use('/storeBHData', require('./routes/storeBHData'));

// Gestione delle rotte non esistenti
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// Middleware per la gestione degli errori
app.use(errorHandler);

// Connessione a MongoDB
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});