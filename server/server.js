import express from 'express';
import connectDB from './db/db.js';
import { getSupportAgent } from './agents/supportAgent.js';
import { getDashboardAgent } from './agents/dashboardAgent.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.post('/api/support', async (req, res) => {
  try {
    const supportAgent = await getSupportAgent();
    const result = await supportAgent.run(req.body.query);
    res.json({ result });
  } catch (error) {
    console.error('Support agent error:', error);
    res.status(500).json({ error: 'Failed to process support query', details: error.message });
  }
});

app.post('/api/dashboard', async (req, res) => {
  try {
    const dashboardAgent = await getDashboardAgent();
    const result = await dashboardAgent.run(req.body.query);
    res.json({ result });
  } catch (error) {
    console.error('Dashboard agent error:', error);
    res.status(500).json({ error: 'Failed to process dashboard query', details: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});