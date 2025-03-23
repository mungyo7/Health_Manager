'use client';

import { useState, useEffect } from 'react';
import { getWorkoutLogs, WorkoutLog } from '../lib/api';

export default function WorkoutLogList() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkoutLogs() {
      try {
        setLoading(true);
        // 현재 날짜로부터 30일 전 데이터부터 조회
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const fetchedLogs = await getWorkoutLogs(startDate);
        setLogs(fetchedLogs);
      } catch (err: any) {
        setError(err.message || '운동 기록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkoutLogs();
  }, []);

  // 목록 새로고침 함수
  const refreshLogs = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const fetchedLogs = await getWorkoutLogs(startDate);
      setLogs(fetchedLogs);
      setError(null);
    } catch (err: any) {
      setError(err.message || '운동 기록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // 모바일에서는 짧은 형식 사용
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      return date.toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric'
      });
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="relative border-2 border-primary/50 bg-black/80 shadow-[0_0_15px_rgba(194,255,0,0.2)] p-4 md:p-6 mb-6 cyber-container">
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="h-5 w-1.5 bg-primary mr-2"></div>
          <h2 className="text-lg md:text-xl font-bold text-primary uppercase tracking-widest neon-text">RECENT_WORKOUT_LOGS</h2>
        </div>
        <button
          onClick={refreshLogs}
          disabled={loading}
          className="text-black bg-primary hover:bg-primary/90 px-3 py-1 md:px-4 md:py-1 text-xs md:text-sm uppercase tracking-wider font-bold hover:shadow-[0_0_8px_rgba(194,255,0,0.5)] transition-all duration-200"
        >
          {loading ? 'LOADING...' : 'REFRESH'}
        </button>
      </div>

      {error && (
        <div className="p-2 md:p-3 mb-4 text-xs md:text-sm text-red-400 bg-red-900/30 border border-red-500/50 shadow-[0_0_8px_rgba(255,42,109,0.3)]">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-6 h-40 flex flex-col items-center justify-center">
          <div className="h-4 w-4 bg-primary animate-ping mb-3"></div>
          <div className="text-primary/80 uppercase tracking-widest text-sm md:text-base">LOADING_DATA...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center p-6 h-40 flex flex-col items-center justify-center border border-primary/20 bg-black/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="text-gray-400 text-xs md:text-sm uppercase tracking-widest">NO_WORKOUT_RECORDS_FOUND</div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0 border border-primary/20 shadow-inner bg-black/60">
          <table className="w-full text-xs md:text-sm text-left text-gray-300">
            <thead>
              <tr className="border-b border-primary/30 bg-primary/10 text-primary uppercase tracking-wider">
                <th scope="col" className="px-2 md:px-6 py-2 md:py-3">DATE</th>
                <th scope="col" className="px-2 md:px-6 py-2 md:py-3">STATUS</th>
                <th scope="col" className="px-2 md:px-6 py-2 md:py-3">DURATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-primary/5 transition-colors duration-150"
                >
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap font-mono">{formatDate(log.workout_date)}</td>
                  <td className="px-2 md:px-6 py-2 md:py-4">
                    {log.completed ? (
                      <span className="text-primary font-bold px-2 py-0.5 bg-primary/10 border border-primary/30 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold px-2 py-0.5 bg-red-900/20 border border-red-500/30 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        INCOMPLETE
                      </span>
                    )}
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 font-mono text-primary/80">
                    {log.duration_minutes ? (
                      <span className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {log.duration_minutes} MIN
                      </span>
                    ) : (
                      <span className="text-gray-500">--:--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 