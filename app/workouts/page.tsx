'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWorkoutTypes, addWorkoutType, updateWorkoutType, deleteWorkoutType, WorkoutType } from '../lib/api';

// 운동 카테고리 목록
const EXERCISE_CATEGORIES = [
  'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'OTHER'
];

// 초기 세트 정보
const INITIAL_SET = { weight: 0, reps: 0 };

export default function WorkoutsPage() {
  const [date, setDate] = useState('');
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // 운동 종류 관리 관련 상태
  const [exerciseTypes, setExerciseTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManageExercises, setShowManageExercises] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [editingExerciseType, setEditingExerciseType] = useState<WorkoutType | null>(null);
  const [deleteExerciseTypeId, setDeleteExerciseTypeId] = useState<string | null>(null);

  // 운동 기록 및 운동 종류 초기화
  useEffect(() => {
    // 오늘 날짜 설정
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);

    // 로컬 스토리지에서 운동 기록 불러오기
    const savedExerciseData = localStorage.getItem('exerciseHistory');
    if (savedExerciseData) {
      const parsedData = JSON.parse(savedExerciseData);
      setExerciseHistory(parsedData);
      
      // 오늘 날짜의 데이터 필터링
      const todayExercises = parsedData.filter((item: any) => item.date === formattedDate);
      setWorkoutData(todayExercises);
    }
    
    // Supabase에서 운동 종류 불러오기
    fetchExerciseTypes();
  }, []);

  // Supabase에서 운동 종류 불러오기
  const fetchExerciseTypes = async () => {
    try {
      setLoading(true);
      const types = await getWorkoutTypes();
      setExerciseTypes(types);
      setError(null);
    } catch (err: any) {
      setError(err.message || '운동 종류를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching workout types:', err);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경시 해당 날짜의 운동 기록 불러오기
  useEffect(() => {
    if (exerciseHistory.length > 0) {
      const filteredExercises = exerciseHistory.filter((item: any) => item.date === date);
      setWorkoutData(filteredExercises);
    }
  }, [date, exerciseHistory]);

  // 운동 종류 선택 핸들러
  const handleExerciseSelect = (exerciseId: string) => {
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
  const handleAddExerciseType = async () => {
    if (!newExerciseName.trim()) return;
    
    try {
      setLoading(true);
      const newExerciseType = await addWorkoutType(newExerciseName.toUpperCase());
      
      // 상태 업데이트
      setExerciseTypes([...exerciseTypes, newExerciseType]);
      
      // 입력 필드 초기화
      setNewExerciseName('');
      setError(null);
    } catch (err: any) {
      console.error('Error adding workout type:', err);
      
      // 인증 관련 오류 메시지 개선
      if (err.message && (
        err.message.includes('로그인') || 
        err.message.includes('인증') || 
        err.message.includes('security policy'))
      ) {
        setError('로그인이 필요하거나 권한이 없습니다. 로그인 상태를 확인해주세요.');
      } else {
        setError(err.message || '운동 종류를 추가하는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 운동 종류 수정 준비 핸들러
  const handlePrepareEditExerciseType = (exerciseType: WorkoutType) => {
    setEditingExerciseType(exerciseType);
    setNewExerciseName(exerciseType.name);
  };
  
  // 운동 종류 수정 완료 핸들러
  const handleUpdateExerciseType = async () => {
    if (!editingExerciseType || !newExerciseName.trim()) return;
    
    try {
      setLoading(true);
      const updatedType = await updateWorkoutType(
        editingExerciseType.id,
        newExerciseName.toUpperCase()
      );
      
      // 상태 업데이트
      const updatedExerciseTypes = exerciseTypes.map(ex => 
        ex.id === editingExerciseType.id ? updatedType : ex
      );
      
      setExerciseTypes(updatedExerciseTypes);
      
      // 입력 필드 및 편집 상태 초기화
      setNewExerciseName('');
      setEditingExerciseType(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || '운동 종류를 업데이트하는 중 오류가 발생했습니다.');
      console.error('Error updating workout type:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 운동 종류 삭제 핸들러
  const handleDeleteExerciseType = (id: string) => {
    setDeleteExerciseTypeId(id);
  };
  
  // 운동 종류 삭제 확인 핸들러
  const confirmDeleteExerciseType = async () => {
    if (!deleteExerciseTypeId) return;
    
    try {
      setLoading(true);
      await deleteWorkoutType(deleteExerciseTypeId);
      
      // 상태 업데이트
      const updatedExerciseTypes = exerciseTypes.filter(ex => ex.id !== deleteExerciseTypeId);
      setExerciseTypes(updatedExerciseTypes);
      
      setDeleteExerciseTypeId(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || '운동 종류를 삭제하는 중 오류가 발생했습니다.');
      console.error('Error deleting workout type:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 운동 종류 관리 토글 핸들러
  const toggleManageExercises = () => {
    setShowManageExercises(!showManageExercises);
    
    // 편집 상태 초기화
    if (!showManageExercises) {
      setNewExerciseName('');
      setEditingExerciseType(null);
    }
  };

  // 해당 날짜 형식 반환
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary neon-text">WORKOUT RECORD</h1>
        
        <div className="flex space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-black border border-primary/50 text-white px-3 py-1"
          />
          
          <button
            onClick={toggleManageExercises}
            className="text-black bg-primary hover:bg-primary/90 px-4 py-1"
          >
            {showManageExercises ? '운동 기록으로 돌아가기' : '운동 종류 관리'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center my-6">
          <div className="text-primary text-lg">로딩 중...</div>
        </div>
      )}
      
      {/* 운동 종류 관리 섹션 */}
      {showManageExercises ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary">운동 종류 관리</h2>
          
          {/* 운동 종류 추가 폼 */}
          <div className="p-4 border border-primary/50 bg-black/80">
            <h3 className="text-lg font-medium mb-3 text-white">
              {editingExerciseType ? '운동 종류 수정' : '새 운동 종류 추가'}
            </h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="운동 이름"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className="flex-1 bg-black border border-primary/70 text-white px-3 py-2"
              />
              
              {editingExerciseType ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateExerciseType}
                    disabled={loading || !newExerciseName.trim()}
                    className="px-4 py-2 bg-primary text-black disabled:opacity-50"
                  >
                    수정
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingExerciseType(null);
                      setNewExerciseName('');
                    }}
                    className="px-4 py-2 border border-primary/70 text-white"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddExerciseType}
                  disabled={loading || !newExerciseName.trim()}
                  className="px-4 py-2 bg-primary text-black disabled:opacity-50"
                >
                  추가
                </button>
              )}
            </div>
          </div>
          
          {/* 운동 종류 목록 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 border border-primary/30">운동 이름</th>
                  <th className="p-3 border border-primary/30 w-48">액션</th>
                </tr>
              </thead>
              <tbody>
                {exerciseTypes.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-gray-400">
                      저장된 운동 종류가 없습니다. 새 운동 종류를 추가하세요.
                    </td>
                  </tr>
                ) : (
                  exerciseTypes.map((exerciseType) => (
                    <tr key={exerciseType.id} className="border-b border-primary/30">
                      <td className="p-3 border border-primary/30">{exerciseType.name}</td>
                      <td className="p-3 border border-primary/30">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePrepareEditExerciseType(exerciseType)}
                            className="px-3 py-1 bg-primary/30 text-white hover:bg-primary/40"
                          >
                            수정
                          </button>
                          
                          {deleteExerciseTypeId === exerciseType.id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={confirmDeleteExerciseType}
                                className="px-2 py-1 bg-red-700 text-white hover:bg-red-600"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => setDeleteExerciseTypeId(null)}
                                className="px-2 py-1 bg-gray-600 text-white hover:bg-gray-500"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteExerciseType(exerciseType.id)}
                              className="px-3 py-1 bg-red-900/50 text-white hover:bg-red-900/70"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 운동 기록 섹션 */
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">{formattedDate} 운동 기록</h2>
          
          {/* 새 운동 추가 폼 */}
          <div id="edit-form" className="p-4 border border-primary/50 bg-black/80">
            <h3 className="text-lg font-medium mb-3 text-white">
              {editingWorkoutId ? '운동 수정' : '새 운동 추가'}
            </h3>
            
            {/* 운동 선택 */}
            {!selectedExercise && !exercises.length && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">운동 선택</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {loading ? (
                    <div className="text-gray-400">운동 종류를 불러오는 중...</div>
                  ) : exerciseTypes.length === 0 ? (
                    <div className="text-gray-400">저장된 운동 종류가 없습니다.</div>
                  ) : (
                    exerciseTypes.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => handleExerciseSelect(exercise.id)}
                        className="text-left px-3 py-2 bg-gray-800 border border-primary/30 hover:bg-gray-700"
                      >
                        {exercise.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* 선택한 운동 */}
            {showExerciseForm && (
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-gray-400">선택한 운동:</span>
                  <span className="ml-2 text-white">
                    {exerciseTypes.find(ex => ex.id === selectedExercise)?.name}
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handleAddExercise}
                    className="px-3 py-1 bg-primary text-black"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExercise(null);
                      setShowExerciseForm(false);
                    }}
                    className="px-3 py-1 border border-primary/50 text-white"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
            
            {/* 세트 정보 입력 */}
            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id} className="border border-primary/30 p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-white">{exercise.exerciseName}</h4>
                      <button
                        onClick={() => handleAddSet(exerciseIndex)}
                        className="px-2 py-1 bg-primary/30 text-white text-sm"
                      >
                        + 세트 추가
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-primary/30">
                          <tr>
                            <th className="p-2 text-left text-sm text-gray-400">세트</th>
                            <th className="p-2 text-left text-sm text-gray-400">무게 (kg)</th>
                            <th className="p-2 text-left text-sm text-gray-400">횟수</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set: {weight: number, reps: number}, setIndex: number) => (
                            <tr key={setIndex} className="border-b border-gray-800">
                              <td className="p-2">{setIndex + 1}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'weight',
                                    parseInt(e.target.value) || 0
                                  )}
                                  className="w-20 bg-black border border-gray-700 p-1 text-white"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'reps',
                                    parseInt(e.target.value) || 0
                                  )}
                                  className="w-20 bg-black border border-gray-700 p-1 text-white"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  삭제
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-primary/70 text-white"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveWorkout}
                    className="px-4 py-2 bg-primary text-black"
                  >
                    {editingWorkoutId ? '수정 완료' : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 저장된 운동 기록 목록 */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3 text-white">오늘의 운동 기록</h3>
            
            {workoutData.length === 0 ? (
              <div className="text-center py-8 border border-primary/30 bg-black/40">
                <p className="text-gray-400">저장된 운동 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutData.map((workout) => (
                  <div key={workout.id} className="p-4 border border-primary/30 bg-black/40">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-white">{workout.exerciseName}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditWorkout(workout.id)}
                          className="px-3 py-1 bg-primary/30 text-white hover:bg-primary/40 text-sm"
                        >
                          수정
                        </button>
                        
                        {deleteConfirmId === workout.id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => confirmDeleteWorkout(workout.id)}
                              className="px-2 py-1 bg-red-700 text-white hover:bg-red-600 text-sm"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-gray-600 text-white hover:bg-gray-500 text-sm"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="px-3 py-1 bg-red-900/50 text-white hover:bg-red-900/70 text-sm"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-primary/30">
                          <tr>
                            <th className="p-2 text-left text-sm text-gray-400">세트</th>
                            <th className="p-2 text-left text-sm text-gray-400">무게 (kg)</th>
                            <th className="p-2 text-left text-sm text-gray-400">횟수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workout.sets.map((set: {weight: number, reps: number}, index: number) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">{set.weight}</td>
                              <td className="p-2">{set.reps}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-center">
        <Link 
          href="/" 
          className="px-6 py-3 border border-primary text-primary hover:bg-primary/10"
        >
          캘린더로 돌아가기
        </Link>
      </div>
    </div>
  );
} 