import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './modules/auth/auth.module';
import userRouter from './modules/user/user.module';
import storeRouter from './modules/store/store.module';
import productRouter from './modules/product/product.module';
import reviewRouter from './modules/review/review.module';
import cartRouter from './modules/cart/cart.module';
import orderRouter from './modules/order/order.module';
import inquiryRouter from './modules/inquiry/inquiry.module';
import notificationRouter from './modules/notification/notification.module';
import dashboardRouter from './modules/dashboard/dashboard.module';
import metadataRouter from './modules/metadata/metadata.module';
import s3Router from './modules/s3/s3.module';
import { errorHandler } from './common/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: true,
    // origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/stores', storeRouter);
app.use('/api/products', productRouter);
app.use('/api/product', reviewRouter);
app.use('/api/review', reviewRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/metadata', metadataRouter);
app.use('/api/s3', s3Router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
export default app;
