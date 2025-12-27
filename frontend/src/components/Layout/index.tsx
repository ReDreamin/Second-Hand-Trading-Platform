import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import styles from './index.module.css';

const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
