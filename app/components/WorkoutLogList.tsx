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
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="bg-gray-800 border border-primary/30 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">최근 운동 기록</h2>
        <button
          onClick={refreshLogs}
          disabled={loading}
          className="text-white bg-primary/30 hover:bg-primary/40 px-3 py-1 rounded-md text-sm"
        >
          {loading ? '불러오는 중...' : '새로고침'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">
          <div className="text-primary">불러오는 중...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center p-4 text-gray-400">
          최근 30일간의 운동 기록이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700 text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">날짜</th>
                <th scope="col" className="px-6 py-3">상태</th>
                <th scope="col" className="px-6 py-3">운동 시간 (분)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="px-6 py-4">{formatDate(log.workout_date)}</td>
                  <td className="px-6 py-4">
                    {log.completed ? (
                      <span className="text-green-400">완료</span>
                    ) : (
                      <span className="text-red-400">미완료</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.duration_minutes || '-'}
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