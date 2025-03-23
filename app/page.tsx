'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 달력 관련 유틸 함수
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// 더미 운동 데이터
const DUMMY_WORKOUTS = [
  { date: '2023-06-10', duration: 60, completed: true },
  { date: '2023-06-12', duration: 75, completed: true },
  { date: '2023-06-15', duration: 90, completed: true },
  { date: '2023-06-18', duration: 45, completed: false },
  { date: '2023-06-20', duration: 80, completed: true },
  { date: '2023-06-22', duration: 65, completed: true },
  { date: '2023-06-25', duration: 70, completed: true },
  { date: '2023-06-28', duration: 60, completed: true },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState<number>(60);
  const [workoutCompleted, setWorkoutCompleted] = useState<boolean>(true);

  // 현재 보고 있는 연도와 월
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 로컬 스토리지에서 운동 데이터 불러오기
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    } else {
      // 더미 데이터 사용
      setWorkouts(DUMMY_WORKOUTS);
      localStorage.setItem('workouts', JSON.stringify(DUMMY_WORKOUTS));
    }
  }, []);

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
    setSelectedDate(date);
    const existingWorkout = workouts.find(workout => workout.date === date);
    if (existingWorkout) {
      setWorkoutDuration(existingWorkout.duration);
      setWorkoutCompleted(existingWorkout.completed);
    } else {
      setWorkoutDuration(60);
      setWorkoutCompleted(true);
    }
  };

  // 운동 기록 저장 핸들러
  const handleSaveWorkout = () => {
    if (!selectedDate) return;

    const updatedWorkouts = [...workouts];
    const existingIndex = updatedWorkouts.findIndex(workout => workout.date === selectedDate);

    if (existingIndex >= 0) {
      updatedWorkouts[existingIndex] = {
        ...updatedWorkouts[existingIndex],
        duration: workoutDuration,
        completed: workoutCompleted
      };
    } else {
      updatedWorkouts.push({
        date: selectedDate,
        duration: workoutDuration,
        completed: workoutCompleted
      });
    }

    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    setSelectedDate(null); // 선택 초기화
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
    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const workout = workouts.find(w => w.date === date);
    calendarDays.push({ day, date, workout });
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
                      {dayData.workout.duration}분
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

      {/* 선택한 날짜의 운동 기록 추가/수정 폼 */}
      {selectedDate && (
        <div className="mt-6 p-4 border border-primary/70 bg-black/80 neon-border">
          <h3 className="text-lg font-medium mb-4 neon-text">
            {selectedDate} WORKOUT LOG
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                WORKOUT DURATION (MIN)
              </label>
              <input
                type="number"
                min="0"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black border border-primary/70 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="completed"
                checked={workoutCompleted}
                onChange={(e) => setWorkoutCompleted(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-primary/70 rounded-none bg-black"
              />
              <label htmlFor="completed" className="ml-2 block text-sm text-white">
                COMPLETED
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveWorkout}
                className="px-4 py-2 border border-primary bg-primary text-black hover:bg-primary/90"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link 
          href="/workouts" 
          className="px-6 py-3 bg-primary text-black font-bold hover:bg-primary/90 neon-border"
        >
          RECORD WORKOUT SETS
        </Link>
      </div>
    </div>
  );
}
