require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('HealthyEats Backend is running ');
});

// mount auth
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✔️  MongoDB connected');
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on port ${PORT}`)
  );
})
.catch(err => {
  console.error(' MongoDB connection error:', err);
  process.exit(1);
});
