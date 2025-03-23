'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 border border-primary shadow-[0_0_15px_rgba(0,255,255,0.5)] rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary neon-text">
            로그인
          </h2>
          <div className="mt-2 h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="text-xs text-primary uppercase tracking-wider mb-1 block">
                아이디(이메일)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-primary focus:border-primary text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="ENTER_EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute right-3 top-9 h-3 w-3 bg-primary animate-pulse rounded-full"></div>
            </div>
            <div className="relative">
              <label htmlFor="password" className="text-xs text-primary uppercase tracking-wider mb-1 block">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-primary focus:border-primary text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="ENTER_PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-3 top-9 h-3 w-3 bg-primary animate-pulse rounded-full"></div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 bg-primary/20 border border-primary text-sm font-bold uppercase tracking-wider rounded-md text-primary hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <span className="animate-ping h-5 w-5 rounded-full bg-primary/50"></span>
                ) : (
                  <span className="h-5 w-5 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </span>
              {loading ? 'CONNECTING...' : 'LOGIN'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 border-b border-primary/30 hover:border-primary/80">
              지금 가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 