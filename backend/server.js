const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));

const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' || true) {
  app.use(express.static(frontendDist));
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  app.get('/auth', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  app.get('/documents', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  app.get('/apitester', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  app.get('/responses', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  app.get('/settings', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
