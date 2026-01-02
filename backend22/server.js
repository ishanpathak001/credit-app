const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/users');
const customersRouter = require("./routes/customers");
const creditsRouter = require('./routes/credits');
const transactionsRouter =require("./routes/transactions") ;
const analyticsRouter = require('./routes/analytics');




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // enables CORS
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use("/api/customers", customersRouter);
app.use('/api/credits', creditsRouter);
app.use("/api/transactions", transactionsRouter);
app.use('/api/analytics', analyticsRouter);



app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
