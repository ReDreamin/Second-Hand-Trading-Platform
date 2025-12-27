import { Navigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 守护路由组件
 * 检查是否存在有效的 JWT token，如果没有则重定向到登录页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = storage.getToken();

  if (!token) {
    // 将当前路径保存到 state 中，登录后可以重定向回来
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
