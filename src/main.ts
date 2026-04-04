import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './modules/auth/auth.module';
import userRouter from './modules/user/user.module';
import storeRouter from './modules/store/store.module';
import productRouter from './modules/product/product.module';
import reviewRouter from './modules/review/review.module';
import { errorHandler } from './common/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/store', storeRouter);
app.use('/product', productRouter);
app.use('/review', reviewRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
export default app;
