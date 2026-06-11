import { useState } from 'react';
import { Sidebar, type Page } from './components/Sidebar';
import { HomePage } from './pages/Home';
import { ActivityLogsPage } from './pages/ActivityLogs';

export function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="app-layout">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="main-content">
        {page === 'home' ? <HomePage /> : <ActivityLogsPage />}
      </main>
    </div>
  );
}
