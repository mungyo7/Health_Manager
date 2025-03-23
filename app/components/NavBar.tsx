'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { useState } from 'react';

export default function NavBar() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/auth/login');
      router.refresh();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-black border-b border-primary/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary mr-2 md:mr-3"></div>
              <h1 className="text-lg md:text-xl font-bold text-primary neon-text">Health Manager</h1>
            </div>
            
            {/* 데스크탑 내비게이션 */}
            <nav className="ml-6 md:ml-8 hidden md:flex space-x-4 md:space-x-8">
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
          
          <div className="flex items-center space-x-3">
            {/* 모바일 로그인/로그아웃 버튼 - 항상 표시 */}
            {!isLoading && (
              <div className="md:hidden">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-3 py-1 border border-primary text-xs font-medium rounded-md text-white hover:bg-primary/20 focus:outline-none"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-3 py-1 border border-primary text-xs font-medium rounded-md text-white hover:bg-primary/20 focus:outline-none bg-primary/10"
                  >
                    로그인
                  </Link>
                )}
              </div>
            )}
            
            {/* 모바일 메뉴 토글 버튼 */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={toggleMobileMenu}
                className="text-white hover:text-primary focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* 데스크탑 사용자 메뉴 */}
            <div className="hidden md:flex items-center">
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
        
        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-primary/30">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="px-3 py-2 text-sm font-medium text-white hover:text-primary hover:bg-primary/10 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                CALENDAR
              </Link>
              <Link 
                href="/workouts" 
                className="px-3 py-2 text-sm font-medium text-white hover:text-primary hover:bg-primary/10 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                WORKOUTS
              </Link>
            </nav>
            
            {/* 회원가입 버튼은 여기에 남겨둠 */}
            {!isLoading && !user && (
              <div className="mt-4 pt-4 border-t border-primary/30">
                <div className="flex justify-center px-3">
                  <Link
                    href="/auth/register"
                    className="w-full px-4 py-2 bg-primary text-sm font-medium rounded-md text-black hover:bg-primary/80 focus:outline-none text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            )}
            
            {/* 로그인한 사용자의 이메일 정보 표시 */}
            {!isLoading && user && (
              <div className="mt-4 pt-4 border-t border-primary/30">
                <div className="px-3">
                  <span className="text-sm text-white">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
} 