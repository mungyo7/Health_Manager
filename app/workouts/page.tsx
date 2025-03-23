'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 기본 운동 종류 데이터
const DEFAULT_EXERCISE_TYPES = [
  { id: 1, name: 'BENCH PRESS', category: 'CHEST' },
  { id: 2, name: 'SQUAT', category: 'LEGS' },
  { id: 3, name: 'DEADLIFT', category: 'BACK' },
  { id: 4, name: 'SHOULDER PRESS', category: 'SHOULDERS' },
  { id: 5, name: 'BICEP CURL', category: 'ARMS' },
  { id: 6, name: 'TRICEP EXTENSION', category: 'ARMS' },
  { id: 7, name: 'LAT PULL-DOWN', category: 'BACK' },
  { id: 8, name: 'LEG PRESS', category: 'LEGS' },
  { id: 9, name: 'FLY', category: 'CHEST' },
  { id: 10, name: 'LATERAL RAISE', category: 'SHOULDERS' },
];

// 운동 카테고리 목록
const EXERCISE_CATEGORIES = [
  'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'OTHER'
];

// 초기 세트 정보
const INITIAL_SET = { weight: 0, reps: 0 };

export default function WorkoutsPage() {
  const [date, setDate] = useState('');
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // 운동 종류 관리 관련 상태
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  const [showManageExercises, setShowManageExercises] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState(EXERCISE_CATEGORIES[0]);
  const [editingExerciseType, setEditingExerciseType] = useState<any | null>(null);
  const [deleteExerciseTypeId, setDeleteExerciseTypeId] = useState<number | null>(null);

  // 운동 기록 및 운동 종류 초기화
  useEffect(() => {
    // 오늘 날짜 설정
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);

    // 로컬 스토리지에서 운동 데이터 불러오기
    const savedExerciseData = localStorage.getItem('exerciseHistory');
    if (savedExerciseData) {
      const parsedData = JSON.parse(savedExerciseData);
      setExerciseHistory(parsedData);
      
      // 오늘 날짜의 데이터 필터링
      const todayExercises = parsedData.filter((item: any) => item.date === formattedDate);
      setWorkoutData(todayExercises);
    }
    
    // 로컬 스토리지에서 운동 종류 불러오기
    const savedExerciseTypes = localStorage.getItem('exerciseTypes');
    if (savedExerciseTypes) {
      setExerciseTypes(JSON.parse(savedExerciseTypes));
    } else {
      // 기본 운동 종류 저장
      setExerciseTypes(DEFAULT_EXERCISE_TYPES);
      localStorage.setItem('exerciseTypes', JSON.stringify(DEFAULT_EXERCISE_TYPES));
    }
  }, []);

  // 날짜 변경시 해당 날짜의 운동 기록 불러오기
  useEffect(() => {
    if (exerciseHistory.length > 0) {
      const filteredExercises = exerciseHistory.filter((item: any) => item.date === date);
      setWorkoutData(filteredExercises);
    }
  }, [date, exerciseHistory]);

  // 운동 종류 선택 핸들러
  const handleExerciseSelect = (exerciseId: number) => {
    setSelectedExercise(exerciseId);
    setShowExerciseForm(true);
  };

  // 운동 추가 핸들러
  const handleAddExercise = () => {
    if (!selectedExercise) return;
    
    const exercise = exerciseTypes.find(ex => ex.id === selectedExercise);
    if (!exercise) return;
    
    const newExercise = {
      id: Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [{ ...INITIAL_SET }]
    };
    
    setExercises([...exercises, newExercise]);
    setSelectedExercise(null);
    setShowExerciseForm(false);
  };

  // 세트 추가 핸들러
  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ ...INITIAL_SET });
    setExercises(updatedExercises);
  };

  // 세트 삭제 핸들러
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    setExercises(updatedExercises);
  };

  // 세트 업데이트 핸들러
  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  // 운동 기록 저장 핸들러
  const handleSaveWorkout = () => {
    if (exercises.length === 0) return;
    
    let updatedHistory = [...exerciseHistory];
    
    if (editingWorkoutId) {
      // 수정 모드인 경우 기존 운동 삭제
      updatedHistory = updatedHistory.filter(item => item.id !== editingWorkoutId);
      setEditingWorkoutId(null);
    }
    
    const workoutToSave = exercises.map(exercise => ({
      ...exercise,
      date,
    }));
    
    // 현재 운동 기록에 추가
    updatedHistory = [...updatedHistory, ...workoutToSave];
    setExerciseHistory(updatedHistory);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('exerciseHistory', JSON.stringify(updatedHistory));
    
    // 현재 날짜의 운동 기록 업데이트
    const currentDateExercises = updatedHistory.filter(item => item.date === date);
    setWorkoutData(currentDateExercises);
    
    // 운동 입력 폼 초기화
    setExercises([]);
  };
  
  // 운동 수정 핸들러
  const handleEditWorkout = (workoutId: number) => {
    const workoutToEdit = exerciseHistory.find(item => item.id === workoutId);
    if (!workoutToEdit) return;
    
    setExercises([workoutToEdit]);
    setEditingWorkoutId(workoutId);
    
    // 스크롤을 편집 폼 위치로 이동
    const editFormElement = document.getElementById('edit-form');
    if (editFormElement) {
      editFormElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 운동 삭제 핸들러
  const handleDeleteWorkout = (workoutId: number) => {
    setDeleteConfirmId(workoutId);
  };
  
  // 운동 삭제 확인 핸들러
  const confirmDeleteWorkout = (workoutId: number) => {
    const updatedHistory = exerciseHistory.filter(item => item.id !== workoutId);
    setExerciseHistory(updatedHistory);
    
    // 로컬 스토리지 업데이트
    localStorage.setItem('exerciseHistory', JSON.stringify(updatedHistory));
    
    // 현재 날짜의 운동 기록 업데이트
    const currentDateExercises = updatedHistory.filter(item => item.date === date);
    setWorkoutData(currentDateExercises);
    
    setDeleteConfirmId(null);
  };
  
  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setExercises([]);
    setEditingWorkoutId(null);
  };
  
  // 운동 종류 추가 핸들러
  const handleAddExerciseType = () => {
    if (!newExerciseName.trim()) return;
    
    const newId = exerciseTypes.length > 0 
      ? Math.max(...exerciseTypes.map(ex => ex.id)) + 1 
      : 1;
    
    const newExerciseType = {
      id: newId,
      name: newExerciseName.toUpperCase(),
      category: newExerciseCategory
    };
    
    const updatedExerciseTypes = [...exerciseTypes, newExerciseType];
    setExerciseTypes(updatedExerciseTypes);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('exerciseTypes', JSON.stringify(updatedExerciseTypes));
    
    // 입력 필드 초기화
    setNewExerciseName('');
    setNewExerciseCategory(EXERCISE_CATEGORIES[0]);
  };
  
  // 운동 종류 수정 준비 핸들러
  const handlePrepareEditExerciseType = (exerciseType: any) => {
    setEditingExerciseType(exerciseType);
    setNewExerciseName(exerciseType.name);
    setNewExerciseCategory(exerciseType.category);
  };
  
  // 운동 종류 수정 완료 핸들러
  const handleUpdateExerciseType = () => {
    if (!editingExerciseType || !newExerciseName.trim()) return;
    
    const updatedExerciseTypes = exerciseTypes.map(ex => 
      ex.id === editingExerciseType.id 
        ? { ...ex, name: newExerciseName.toUpperCase(), category: newExerciseCategory } 
        : ex
    );
    
    setExerciseTypes(updatedExerciseTypes);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('exerciseTypes', JSON.stringify(updatedExerciseTypes));
    
    // 수정 모드 종료
    setEditingExerciseType(null);
    setNewExerciseName('');
    setNewExerciseCategory(EXERCISE_CATEGORIES[0]);
  };
  
  // 운동 종류 삭제 핸들러
  const handleDeleteExerciseType = (id: number) => {
    setDeleteExerciseTypeId(id);
  };
  
  // 운동 종류 삭제 확인 핸들러
  const confirmDeleteExerciseType = () => {
    if (deleteExerciseTypeId === null) return;
    
    // 해당 운동 종류를 사용하는 운동 기록 찾기
    const usedInWorkouts = exerciseHistory.some(
      workout => workout.exerciseId === deleteExerciseTypeId
    );
    
    if (usedInWorkouts) {
      alert('이 운동 종류를 사용하는 운동 기록이 있습니다. 삭제할 수 없습니다.');
      setDeleteExerciseTypeId(null);
      return;
    }
    
    const updatedExerciseTypes = exerciseTypes.filter(ex => ex.id !== deleteExerciseTypeId);
    setExerciseTypes(updatedExerciseTypes);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('exerciseTypes', JSON.stringify(updatedExerciseTypes));
    
    setDeleteExerciseTypeId(null);
  };
  
  // 운동 종류 관리 화면 토글
  const toggleManageExercises = () => {
    setShowManageExercises(!showManageExercises);
    
    // 수정 모드 초기화
    if (!showManageExercises) {
      setEditingExerciseType(null);
      setNewExerciseName('');
      setNewExerciseCategory(EXERCISE_CATEGORIES[0]);
    }
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold neon-text">WORKOUT SETS</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleManageExercises}
            className="px-3 py-1 bg-black border border-accent text-accent hover:bg-accent/10 transition-colors text-sm"
          >
            {showManageExercises ? 'BACK TO WORKOUTS' : 'MANAGE EXERCISES'}
          </button>
          <div className="flex items-center">
            <label htmlFor="workout-date" className="mr-2 text-primary">DATE:</label>
            <input
              type="date"
              id="workout-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 bg-black border border-primary/70 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* 운동 종류 관리 UI */}
      {showManageExercises ? (
        <div className="space-y-6">
          <div className="exercise-card p-6">
            <h3 className="text-xl font-semibold mb-4 neon-text">
              {editingExerciseType ? 'EDIT EXERCISE TYPE' : 'ADD NEW EXERCISE TYPE'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">EXERCISE NAME</label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="E.G. BENCH PRESS"
                  className="w-full px-3 py-2 bg-black border border-primary/50 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">CATEGORY</label>
                <select
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-primary/50 text-white focus:outline-none focus:border-primary"
                >
                  {EXERCISE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingExerciseType && (
                <button
                  onClick={() => {
                    setEditingExerciseType(null);
                    setNewExerciseName('');
                    setNewExerciseCategory(EXERCISE_CATEGORIES[0]);
                  }}
                  className="px-4 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
                >
                  CANCEL
                </button>
              )}
              <button
                onClick={editingExerciseType ? handleUpdateExerciseType : handleAddExerciseType}
                disabled={!newExerciseName.trim()}
                className={`px-4 py-2 border ${
                  newExerciseName.trim() 
                    ? 'border-primary bg-primary text-black hover:bg-primary/90' 
                    : 'border-gray-600 bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {editingExerciseType ? 'UPDATE' : 'ADD'}
              </button>
            </div>
          </div>
          
          <div className="exercise-card">
            <h3 className="text-xl font-semibold mb-4 neon-text">EXERCISE TYPES</h3>
            {exerciseTypes.length === 0 ? (
              <p className="text-gray-400">No exercise types defined. Add some above.</p>
            ) : (
              <div className="space-y-3">
                {exerciseTypes.map(exerciseType => (
                  <div 
                    key={exerciseType.id} 
                    className="border border-primary/30 p-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-primary font-medium">{exerciseType.name}</h4>
                      <span className="text-sm text-gray-400">{exerciseType.category}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePrepareEditExerciseType(exerciseType)}
                        className="px-2 py-1 bg-black border border-primary/70 text-primary hover:bg-primary/10 text-sm"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDeleteExerciseType(exerciseType.id)}
                        className="px-2 py-1 bg-black border border-danger/70 text-danger hover:bg-danger/10 text-sm"
                      >
                        DELETE
                      </button>
                    </div>
                    
                    {deleteExerciseTypeId === exerciseType.id && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                        <div className="border border-danger/70 bg-black p-4 max-w-md">
                          <h4 className="text-lg font-medium text-danger mb-4">DELETE EXERCISE TYPE?</h4>
                          <p className="text-white mb-4">
                            Are you sure you want to delete "{exerciseType.name}"? 
                            This cannot be undone.
                          </p>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setDeleteExerciseTypeId(null)}
                              className="px-3 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
                            >
                              CANCEL
                            </button>
                            <button
                              onClick={confirmDeleteExerciseType}
                              className="px-3 py-2 border border-danger bg-danger/10 text-danger hover:bg-danger/20"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* 기존 운동 기록 */}
          {workoutData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 neon-text">
                {date === new Date().toISOString().split('T')[0] ? "TODAY'S WORKOUTS" : "WORKOUTS FOR " + date}
              </h3>
              <div className="space-y-4">
                {workoutData.map((workout, i) => (
                  <div key={i} className="exercise-card">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-primary">{workout.exerciseName}</h4>
                        <span className="text-sm text-gray-400">{workout.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditWorkout(workout.id)}
                          className="px-2 py-1 bg-black border border-primary/70 text-primary hover:bg-primary/10 text-sm"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="px-2 py-1 bg-black border border-danger/70 text-danger hover:bg-danger/10 text-sm"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                    
                    {deleteConfirmId === workout.id ? (
                      <div className="p-3 border border-danger/50 bg-danger/10 mb-3">
                        <p className="text-white mb-2">DELETE THIS WORKOUT?</p>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-black border border-primary/70 text-primary text-sm"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => confirmDeleteWorkout(workout.id)}
                            className="px-2 py-1 bg-danger text-white text-sm"
                          >
                            CONFIRM DELETE
                          </button>
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="space-y-2">
                      {workout.sets.map((set: any, j: number) => (
                        <div key={j} className="set-row bg-black/50 p-2 border border-primary/30">
                          <span className="font-medium text-primary">SET {j + 1}</span>
                          <span className="text-center">{set.weight} KG</span>
                          <span className="text-center">{set.reps} REPS</span>
                          <span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 운동 추가/수정 폼 */}
          <div id="edit-form" className="workout-form space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold neon-text">
                {editingWorkoutId ? 'EDIT EXERCISE' : 'ADD EXERCISE'}
              </h3>
              {!editingWorkoutId && (
                <button
                  onClick={() => setShowExerciseForm(true)}
                  className="px-3 py-1 bg-black border border-primary text-primary hover:bg-primary/10 transition-colors text-sm"
                >
                  + ADD EXERCISE
                </button>
              )}
            </div>

            {/* 운동 선택 폼 */}
            {showExerciseForm && !editingWorkoutId && (
              <div className="p-4 border border-primary/70 bg-black/80 neon-border">
                <h4 className="text-lg font-medium mb-4 text-primary">SELECT EXERCISE</h4>
                {exerciseTypes.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-400 mb-3">No exercise types defined.</p>
                    <button
                      onClick={toggleManageExercises}
                      className="px-3 py-2 border border-accent text-accent hover:bg-accent/10"
                    >
                      MANAGE EXERCISES
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {exerciseTypes.map(exercise => (
                        <button
                          key={exercise.id}
                          onClick={() => handleExerciseSelect(exercise.id)}
                          className={`px-4 py-2 border text-left ${
                            selectedExercise === exercise.id 
                              ? 'border-primary bg-primary/20 text-primary' 
                              : 'border-primary/50 hover:border-primary hover:bg-primary/10'
                          }`}
                        >
                          <div>{exercise.name}</div>
                          <div className="text-xs opacity-70">{exercise.category}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowExerciseForm(false)}
                        className="px-4 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleAddExercise}
                        disabled={!selectedExercise}
                        className={`px-4 py-2 border ${
                          selectedExercise ? 'border-primary bg-primary text-black hover:bg-primary/90' : 'border-gray-600 bg-gray-600 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        ADD
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 운동 세트 입력 */}
            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id} className="exercise-card">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-primary">{exercise.exerciseName}</h4>
                        <span className="text-sm text-gray-400">{exercise.category}</span>
                      </div>
                      <button
                        onClick={() => handleAddSet(exerciseIndex)}
                        className="px-3 py-1 bg-black border border-primary/70 text-primary hover:bg-primary/10 text-sm"
                      >
                        + ADD SET
                      </button>
                    </div>
                    <div className="space-y-2">
                      {exercise.sets.map((set: any, setIndex: number) => (
                        <div key={setIndex} className="set-row">
                          <span className="font-medium text-primary">SET {setIndex + 1}</span>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">WEIGHT (KG)</label>
                            <input
                              type="number"
                              min="0"
                              value={set.weight}
                              onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-black border border-primary/50 text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">REPS</label>
                            <input
                              type="number"
                              min="0"
                              value={set.reps}
                              onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-black border border-primary/50 text-white focus:outline-none focus:border-primary"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            className="mt-4 p-2 text-danger hover:bg-danger/10 border border-danger/50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end mt-6 space-x-3">
                  {editingWorkoutId && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
                    >
                      CANCEL EDIT
                    </button>
                  )}
                  <button
                    onClick={handleSaveWorkout}
                    className="px-6 py-3 bg-primary text-black font-bold hover:bg-primary/90 neon-border"
                  >
                    {editingWorkoutId ? 'UPDATE WORKOUT' : 'SAVE WORKOUT'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-6 flex justify-center">
        <Link 
          href="/" 
          className="px-4 py-2 border border-primary/70 text-primary bg-black hover:bg-primary/10"
        >
          BACK TO CALENDAR
        </Link>
      </div>
    </div>
  );
} 