'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWorkoutLogs, WorkoutLog } from './lib/api';
import WorkoutLogForm from './components/WorkoutLogForm';
import WorkoutLogList from './components/WorkoutLogList';

// 달력 관련 유틸 함수
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 보고 있는 연도와 월
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Supabase에서 운동 데이터 불러오기
  useEffect(() => {
    async function fetchWorkoutLogs() {
      try {
        setLoading(true);
        // 현재 월의 시작일과 마지막일 계산
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        
        const fetchedLogs = await getWorkoutLogs(startDate, endDate);
        setWorkouts(fetchedLogs);
        setError(null);
      } catch (err: any) {
        setError(err.message || '운동 기록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkoutLogs();
  }, [currentYear, currentMonth]);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date));
  };

  // 운동 로그 저장 후 처리
  const handleWorkoutLogSaved = (log: WorkoutLog) => {
    // 현재 표시 중인 월의 데이터인 경우 목록 업데이트
    const logDate = new Date(log.workout_date);
    if (logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonth) {
      // 기존 workouts 목록 업데이트
      const updatedWorkouts = [...workouts];
      const existingIndex = updatedWorkouts.findIndex(w => w.id === log.id);
      
      if (existingIndex >= 0) {
        updatedWorkouts[existingIndex] = log;
      } else {
        updatedWorkouts.push(log);
      }
      
      setWorkouts(updatedWorkouts);
    }
    
    // 선택 초기화
    setSelectedDate(null);
  };

  // 달력에 표시할 날짜들 생성
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // 달력에 표시할 날짜 배열
  const calendarDays = [];

  // 이전 달의 날짜들 추가 (비어있는 셀)
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // 현재 달의 날짜들 추가
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const workout = workouts.find(w => w.workout_date === dateString);
    calendarDays.push({ day, date: dateString, workout });
  }

  // 월 이름 표시용
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold neon-text">{currentYear} / {monthNames[currentMonth]}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-black border border-primary/70 text-primary hover:bg-primary/10 transition-colors"
          >
            PREV
          </button>
          <button 
            onClick={goToNextMonth}
            className="px-4 py-2 bg-black border border-primary/70 text-primary hover:bg-primary/10 transition-colors"
          >
            NEXT
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}

      <div className="calendar-header">
        {WEEKDAYS.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-container">
        {calendarDays.map((dayData, index) => (
          <div 
            key={index} 
            className={`calendar-day ${!dayData ? 'opacity-30' : ''} ${dayData?.workout?.completed ? 'workout-completed' : ''} ${dayData && 'border-primary/50 hover:border-primary'}`}
            onClick={() => dayData && handleDateSelect(dayData.date)}
          >
            {dayData && (
              <>
                <div className="flex justify-between items-center">
                  <span>{dayData.day}</span>
                  {dayData.workout && (
                    <span className="workout-badge">
                      {dayData.workout.duration_minutes || 0}분
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  {dayData.workout && (
                    <div className={`text-xs ${dayData.workout.completed ? 'workout-completed-text' : 'text-warning'}`}>
                      {dayData.workout.completed ? (
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          COMPLETED
                        </span>
                      ) : 'INCOMPLETE'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 선택한 날짜의 운동 기록 폼 */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 neon-text">
            {selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 운동 기록
          </h3>
          <WorkoutLogForm 
            date={selectedDate} 
            onSave={handleWorkoutLogSaved} 
          />
        </div>
      )}

      {/* 운동 기록 목록 */}
      <WorkoutLogList />

      <div className="mt-6 flex justify-center">
        <Link 
          href="/workouts" 
          className="px-6 py-3 bg-primary text-black font-bold hover:bg-primary/90 neon-border"
        >
          운동 세트 기록
        </Link>
      </div>
    </div>
  );
}
