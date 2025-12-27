import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import ProductDetail from '../pages/ProductDetail';
import ProductUpload from '../pages/ProductUpload';
import MyProducts from '../pages/MyProducts';
import Payment from '../pages/Payment';

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
