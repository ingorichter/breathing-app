import { HashRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Home }    from './pages/Home';
import { Setup }   from './pages/Setup';
import { Session } from './pages/Session';
import { Stats }   from './pages/Stats';
import styles from './App.module.css';

export default function App() {
  return (
    <HashRouter>
      <div className={styles.root}>
        <Routes>
          {/* Session is full-screen — no nav bar */}
          <Route path="/session" element={<Session />} />

          {/* All other routes show nav */}
          <Route
            path="*"
            element={
              <>
                <div className={styles.content}>
                  <Routes>
                    <Route path="/"      element={<Home />}  />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/stats" element={<Stats />} />
                  </Routes>
                </div>
                <Nav />
              </>
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}
