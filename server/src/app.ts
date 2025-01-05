import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import walletRoutes from './routes/walletRoutes'

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('FlexPay API is running...');
});

//ROUTES
app.use('/users', userRoutes);
app.use('/wallet', walletRoutes);

export default app;
