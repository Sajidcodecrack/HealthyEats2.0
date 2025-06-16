require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Only include your currently existing routes
const userRoutes = require('./routes/userRoutes');
const userProfileRoutes = require('./routes/userProfileroutes');
const foodAIRoutes = require('./routes/foodAI');
const foodPreferencesRoutes = require('./routes/foodPreferences')
// const reminderRoutes = require('./routes/reminderRoutes');
// Add more as you implement them

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.send('HealthyEats Backend is running');
});

// Mount actual, existing routes only
app.use('/api/user', userRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/foodAI', foodAIRoutes);
app.use('/api/foodPreferences', foodPreferencesRoutes);
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✔️  MongoDB connected');
  app.listen(PORT, () => console.log(` Server listening on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
