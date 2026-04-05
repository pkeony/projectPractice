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

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/stores', storeRouter);
app.use('/products', productRouter);
app.use('/product', reviewRouter);
app.use('/review', reviewRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use('/inquiries', inquiryRouter);
app.use('/notifications', notificationRouter);
app.use('/dashboard', dashboardRouter);
app.use('/metadata', metadataRouter);
app.use('/s3', s3Router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
export default app;
