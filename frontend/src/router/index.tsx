import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import ProductDetail from '../pages/ProductDetail';
import ProductUpload from '../pages/ProductUpload';
import MyProducts from '../pages/MyProducts';
import Payment from '../pages/Payment';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import Purchases from '../pages/Purchases';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'product/:id',
        element: <ProductDetail />,
      },
      {
        path: 'upload',
        element: (
          <ProtectedRoute>
            <ProductUpload />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-products',
        element: (
          <ProtectedRoute>
            <MyProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchases',
        element: (
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/:orderId',
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <Auth />,
  },
]);

export default router;
