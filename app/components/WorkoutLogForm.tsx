'use client';

import { useState, useEffect } from 'react';
import { createOrUpdateWorkoutLog, getWorkoutLogByDate } from '../lib/api';
import { WorkoutLog } from '../lib/api';

type WorkoutLogFormProps = {
  date: Date;
  onSave?: (log: WorkoutLog) => void;
};

export default function WorkoutLogForm({ date, onSave }: WorkoutLogFormProps) {
  const [completed, setCompleted] = useState(false);
  const [duration, setDuration] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 날짜에 맞는 기존 로그 불러오기
  useEffect(() => {
    async function fetchWorkoutLog() {
      try {
        const log = await getWorkoutLogByDate(date);
        if (log) {
          setCompleted(log.completed);
          setDuration(log.duration_minutes || '');
        } else {
          setCompleted(false);
          setDuration('');
        }
      } catch (err) {
        console.error('운동 로그를 불러오는 중 오류 발생:', err);
      }
    }

    fetchWorkoutLog();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const workoutLog = await createOrUpdateWorkoutLog(
        date,
        completed,
        duration === '' ? undefined : Number(duration)
      );
      
      setSuccess(true);
      
      if (onSave) {
        onSave(workoutLog);
      }
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || '운동 로그 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-primary/30 rounded-lg shadow-lg p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold text-primary mb-4">운동 기록</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              id="completed"
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="completed" className="ml-2 text-xs md:text-sm font-medium text-white">
              오늘 운동 완료
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="duration" className="block mb-2 text-xs md:text-sm font-medium text-white">
            운동 시간 (분)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white text-xs md:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
            placeholder="운동 시간을 입력하세요"
            min="0"
          />
        </div>
        
        {error && (
          <div className="p-2 md:p-3 mb-3 md:mb-4 text-xs md:text-sm text-red-400 bg-red-900/30 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-2 md:p-3 mb-3 md:mb-4 text-xs md:text-sm text-green-400 bg-green-900/30 rounded-lg">
            운동 기록이 저장되었습니다!
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="text-black bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary/50 font-medium rounded-lg text-xs md:text-sm w-full sm:w-auto px-4 py-2 text-center"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
} 