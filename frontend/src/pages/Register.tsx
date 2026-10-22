import React, { useState } from 'react';
import { ResultAsync } from 'neverthrow';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, AlertCircle } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export function Register({ onSwitchToLogin }: RegisterProps) {
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    await ResultAsync.fromPromise(register(name, email, password), (err) =>
      err instanceof Error ? err.message : 'Falha ao registrar'
    ).match(
      () => {},
      (errMsg) => setError(errMsg)
    );

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d11] flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-900 to-fuchsia-900 border border-rose-500/30 mb-4 shadow-lg shadow-rose-950/50">
          <Sparkles className="w-8 h-8 text-rose-300" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Junte-se à Aventura</h1>
        <p className="text-sm text-gray-400 mt-1">Crie sua conta para gerenciar fichas e magias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar nova conta</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="register-name"
              label="Seu Nome / Apelido"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mestre dos Magos"
            />

            <Input
              id="register-email"
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aventureiro@dnd.com"
            />

            <Input
              id="register-password"
              label="Senha"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-rose-400 hover:text-rose-300 font-medium ml-1"
            >
              Entrar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
