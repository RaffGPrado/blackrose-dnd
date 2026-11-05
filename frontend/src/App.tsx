import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useSyncStatus } from './hooks/useSyncStatus';

// Code-splitting via dynamic imports for optimized initial bundle & fast mobile FCP
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const CharactersList = React.lazy(() =>
  import('./pages/CharactersList').then((m) => ({ default: m.CharactersList }))
);
const CreateCharacter = React.lazy(() =>
  import('./pages/CreateCharacter').then((m) => ({ default: m.CreateCharacter }))
);
const CharacterView = React.lazy(() =>
  import('./pages/CharacterView').then((m) => ({ default: m.CharacterView }))
);
const DMDashboard = React.lazy(() =>
  import('./pages/DMDashboard').then((m) => ({ default: m.DMDashboard }))
);

function PageLoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-dnd-rose text-xs font-bold tracking-widest uppercase animate-pulse flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-dnd-rose animate-ping" />
        Carregando Grimório...
      </div>
    </div>
  );
}

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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-rose text-sm font-serif font-semibold animate-pulse">
          Abrindo Grimório Black Rose...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Toaster richColors position="top-center" theme="dark" />
      <OfflineBanner
        isOnline={status.isOnline}
        isSyncing={status.isSyncing}
        pendingCount={status.pendingCount}
        onSync={status.syncNow}
      />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {!user ? (
              <>
                <Route
                  path="/login"
                  element={<Login onSwitchToRegister={() => navigate('/register')} />}
                />
                <Route
                  path="/register"
                  element={<Register onSwitchToLogin={() => navigate('/login')} />}
                />
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
        </Suspense>
      </div>
    </div>
  );
}
