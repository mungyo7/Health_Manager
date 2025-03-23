'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="bg-black border-b border-primary/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-primary mr-3"></div>
              <h1 className="text-xl font-bold text-primary neon-text">CYBER-GYM</h1>
            </div>
            <nav className="ml-8 flex space-x-8">
              <Link 
                href="/" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-primary"
              >
                CALENDAR
              </Link>
              <Link 
                href="/workouts" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-primary"
              >
                WORKOUTS
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center px-4 py-1 border border-primary text-sm font-medium rounded-md text-white hover:bg-primary/20 focus:outline-none"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center px-4 py-1 border border-primary text-sm font-medium rounded-md text-white hover:bg-primary/20 focus:outline-none"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center px-4 py-1 bg-primary text-sm font-medium rounded-md text-black hover:bg-primary/80 focus:outline-none"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 