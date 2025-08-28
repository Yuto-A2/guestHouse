const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');       
const propertyRoutes = require('./routes/property');  
require('dotenv').config();                    

const app = express();
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URL;          

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Guesthouse API Server is running!' });
});

app.use('/properties', propertyRoutes);         

// Connect Database
mongoose
  .connect(dbUrl) 
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
