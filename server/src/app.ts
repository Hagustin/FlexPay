import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('FlexPay API is running...');
});

// USER ROUTES
app.use('/users', userRoutes); // Add authRoutes here

export default app;
