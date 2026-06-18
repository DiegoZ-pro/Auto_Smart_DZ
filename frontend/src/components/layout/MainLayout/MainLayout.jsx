// Layout principal del área de taller: header + sidebar + contenido

import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.mainLayout}>
      <Header />
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;