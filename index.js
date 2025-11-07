import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRoutes from './routes.js';
import { testDbConnection } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome! The API server is running.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  testDbConnection();
});