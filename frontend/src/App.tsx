import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CharactersList } from './pages/CharactersList';
import { CreateCharacter } from './pages/CreateCharacter';
import { CharacterView } from './pages/CharacterView';
import { DMDashboard } from './pages/DMDashboard';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useSyncStatus } from './hooks/useSyncStatus';

function CharacterViewWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return <CharacterView characterId={Number(id)} onBack={() => navigate('/')} />;
}

export default function App() {
  const { user, loading, initAuth } = useAuthStore();
  const status = useSyncStatus();
  const navigate = useNavigate();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dnd-dark flex items-center justify-center">
        <div className="text-rose-400 text-sm font-semibold animate-pulse">
          Opening Black Rose Grimoire...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dnd-dark text-dnd-text">
      <OfflineBanner
        isOnline={status.isOnline}
        isSyncing={status.isSyncing}
        pendingCount={status.pendingCount}
        onSync={status.syncNow}
      />
      <div className="flex-1 flex flex-col">
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login onSwitchToRegister={() => navigate('/register')} />} />
              <Route path="/register" element={<Register onSwitchToLogin={() => navigate('/login')} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <CharactersList
                    onSelectCharacter={(id) => navigate(`/character/${id}`)}
                    onCreateCharacter={() => navigate('/create')}
                    onOpenDMDashboard={() => navigate('/dm')}
                  />
                }
              />
              <Route
                path="/create"
                element={
                  <CreateCharacter
                    onBack={() => navigate('/')}
                    onSuccess={(id) => navigate(`/character/${id}`)}
                  />
                }
              />
              <Route path="/dm" element={<DMDashboard onBack={() => navigate('/')} />} />
              <Route path="/character/:id" element={<CharacterViewWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}
