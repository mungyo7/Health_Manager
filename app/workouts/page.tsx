'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getWorkoutTypes, 
  addWorkoutType, 
  updateWorkoutType, 
  deleteWorkoutType, 
  WorkoutType,
  getWorkoutLogByDate,
  createOrUpdateWorkoutLog,
  getWorkoutSets,
  addWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet,
  WorkoutLog,
  WorkoutSet
} from '../lib/api';

// 운동 카테고리 목록
const EXERCISE_CATEGORIES = [
  'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'OTHER'
];

// 초기 세트 정보
const INITIAL_SET = { weight: 0, reps: 0 };

export default function WorkoutsPage() {
  const [date, setDate] = useState('');
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [workoutSets, setWorkoutSets] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [currentExercises, setCurrentExercises] = useState<any[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // 운동 종류 관리 관련 상태
  const [exerciseTypes, setExerciseTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManageExercises, setShowManageExercises] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [editingExerciseType, setEditingExerciseType] = useState<WorkoutType | null>(null);
  const [deleteExerciseTypeId, setDeleteExerciseTypeId] = useState<string | null>(null);

  // 오늘 날짜 설정 및 데이터 로드
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
    
    // Supabase에서 운동 종류 및 해당 날짜의 운동 기록 불러오기
    loadWorkoutData(new Date(formattedDate));
  }, []);

  // 날짜 변경시 해당 날짜의 운동 기록 불러오기
  useEffect(() => {
    if (date) {
      loadWorkoutData(new Date(date));
    }
  }, [date]);

  // 운동 데이터 로드 함수
  const loadWorkoutData = async (selectedDate: Date) => {
    try {
      setLoading(true);
      
      // 운동 종류 불러오기
      const types = await getWorkoutTypes();
      setExerciseTypes(types);
      
      // 선택한 날짜의 운동 로그 불러오기
      const log = await getWorkoutLogByDate(selectedDate);
      setWorkoutLog(log);
      
      // 운동 로그가 있다면 세트 정보 불러오기
      if (log) {
        const sets = await getWorkoutSets(log.id);
        setWorkoutSets(sets);
      } else {
        setWorkoutSets([]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('운동 데이터 로드 중 오류 발생:', err);
      setError(err.message || '운동 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
      id: `temp-${Date.now()}`,
      workout_type_id: exercise.id,
      workout_type: exercise,
      exerciseName: exercise.name,
      sets: [{ weight: 0, reps: 0, set_number: 1 }]
    };
    
    setCurrentExercises([...currentExercises, newExercise]);
    setSelectedExercise(null);
    setShowExerciseForm(false);
  };

  // 세트 추가 핸들러
  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...currentExercises];
    const currentSets = updatedExercises[exerciseIndex].sets;
    
    updatedExercises[exerciseIndex].sets.push({ 
      weight: 0, 
      reps: 0, 
      set_number: currentSets.length + 1 
    });
    
    setCurrentExercises(updatedExercises);
  };

  // 세트 삭제 핸들러
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // 세트 번호 재정렬
    updatedExercises[exerciseIndex].sets.forEach((set: any, idx: number) => {
      set.set_number = idx + 1;
    });
    
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setCurrentExercises(updatedExercises);
  };

  // 세트 업데이트 핸들러
  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setCurrentExercises(updatedExercises);
  };

  // 운동 기록 저장 핸들러
  const handleSaveWorkout = async () => {
    if (currentExercises.length === 0) return;
    
    try {
      setSavingWorkout(true);
      
      // 1. workout_log 생성 또는 업데이트
      const logData = await createOrUpdateWorkoutLog(
        new Date(date), 
        true,  // completed
        undefined    // duration_minutes - null 대신 undefined 사용
      );
      
      // 2. 현재 세트들을 workout_sets 테이블에 저장
      for (const exercise of currentExercises) {
        for (const set of exercise.sets) {
          if (set.id) {
            // 기존 세트 업데이트
            await updateWorkoutSet(
              set.id,
              set.reps,
              set.weight
            );
          } else {
            // 새 세트 추가
            await addWorkoutSet(
              logData.id,
              exercise.workout_type_id,
              set.reps,
              set.weight,
              set.set_number
            );
          }
        }
      }
      
      // 3. 데이터 다시 불러오기
      await loadWorkoutData(new Date(date));
      
      // 4. 입력 폼 초기화
      setCurrentExercises([]);
      setEditingSetId(null);
      setError(null);
    } catch (err: any) {
      console.error('운동 저장 중 오류 발생:', err);
      setError(err.message || '운동 기록을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setSavingWorkout(false);
    }
  };
  
  // 운동 세트 수정 핸들러
  const handleEditSet = (set: any) => {
    // 이미 편집 중인 운동이 있는지 확인
    if (currentExercises.length > 0) {
      if (confirm('진행 중인 편집 내용이 있습니다. 저장하지 않고 계속할까요?') === false) {
        return;
      }
    }
    
    setEditingSetId(set.id);
    
    // 세트를 그룹화하여 운동 별로 정리
    const exerciseType = exerciseTypes.find(type => type.id === set.workout_type_id);
    
    if (!exerciseType) {
      setError('운동 종류 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 같은 운동 종류의 모든 세트 찾기
    const sameSets = workoutSets.filter(s => s.workout_type_id === set.workout_type_id);
    
    // 현재 운동 세트 구성
    const currentExercise = {
      id: `edit-${exerciseType.id}`,
      workout_type_id: exerciseType.id,
      workout_type: exerciseType,
      exerciseName: exerciseType.name,
      sets: sameSets.map((s: any) => ({
        id: s.id,
        weight: s.weight,
        reps: s.reps,
        set_number: s.set_number
      }))
    };
    
    setCurrentExercises([currentExercise]);
    
    // 스크롤을 편집 폼 위치로 이동
    const editFormElement = document.getElementById('edit-form');
    if (editFormElement) {
      editFormElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 운동 세트 삭제 핸들러
  const handleDeleteSet = (setId: string) => {
    setDeleteConfirmId(setId);
  };
  
  // 운동 세트 삭제 확인 핸들러
  const confirmDeleteSet = async (setId: string) => {
    try {
      setLoading(true);
      await deleteWorkoutSet(setId);
      
      // 데이터 다시 불러오기
      await loadWorkoutData(new Date(date));
      
      setDeleteConfirmId(null);
      setError(null);
    } catch (err: any) {
      console.error('세트 삭제 중 오류 발생:', err);
      setError(err.message || '운동 세트를 삭제하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setCurrentExercises([]);
    setEditingSetId(null);
  };
  
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

  // 운동 세트를 운동 종류별로 그룹화하는 함수
  const groupSetsByExercise = () => {
    const groupedSets: { [key: string]: any } = {};
    
    workoutSets.forEach((set: any) => {
      if (!groupedSets[set.workout_type_id]) {
        const exerciseType = exerciseTypes.find(type => type.id === set.workout_type_id);
        groupedSets[set.workout_type_id] = {
          workout_type_id: set.workout_type_id,
          name: exerciseType?.name || '알 수 없는 운동',
          sets: []
        };
      }
      
      groupedSets[set.workout_type_id].sets.push(set);
    });
    
    // 세트 번호 순으로 정렬
    Object.values(groupedSets).forEach(group => {
      group.sets.sort((a: any, b: any) => a.set_number - b.set_number);
    });
    
    return Object.values(groupedSets);
  };

  // 해당 날짜 형식 반환
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 그룹화된 운동 세트
  const groupedExercises = groupSetsByExercise();

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
              {editingSetId ? '운동 세트 수정' : '새 운동 추가'}
            </h3>
            
            {/* 운동 선택 */}
            {!selectedExercise && currentExercises.length === 0 && (
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
            {currentExercises.length > 0 && (
              <div className="space-y-4">
                {currentExercises.map((exercise, exerciseIndex) => (
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
                          {exercise.sets.map((set: {weight: number, reps: number, set_number: number, id?: string}, setIndex: number) => (
                            <tr key={set.id || setIndex} className="border-b border-gray-800">
                              <td className="p-2">{set.set_number}</td>
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
                    disabled={savingWorkout}
                    className="px-4 py-2 bg-primary text-black disabled:opacity-50"
                  >
                    {savingWorkout ? '저장 중...' : (editingSetId ? '수정 완료' : '저장')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 저장된 운동 기록 목록 */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3 text-white">오늘의 운동 기록</h3>
            
            {groupedExercises.length === 0 ? (
              <div className="text-center py-8 border border-primary/30 bg-black/40">
                <p className="text-gray-400">저장된 운동 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedExercises.map((exercise) => (
                  <div key={exercise.workout_type_id} className="p-4 border border-primary/30 bg-black/40">
                    <div className="mb-3">
                      <h4 className="font-medium text-white">{exercise.name}</h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-primary/30">
                          <tr>
                            <th className="p-2 text-left text-sm text-gray-400">세트</th>
                            <th className="p-2 text-left text-sm text-gray-400">무게 (kg)</th>
                            <th className="p-2 text-left text-sm text-gray-400">횟수</th>
                            <th className="p-2 text-right text-sm text-gray-400">액션</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set: any) => (
                            <tr key={set.id} className="border-b border-gray-800">
                              <td className="p-2">{set.set_number}</td>
                              <td className="p-2">{set.weight}</td>
                              <td className="p-2">{set.reps}</td>
                              <td className="p-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditSet(set)}
                                    className="px-2 py-1 bg-primary/30 text-white hover:bg-primary/40 text-xs"
                                  >
                                    수정
                                  </button>
                                  
                                  {deleteConfirmId === set.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => confirmDeleteSet(set.id)}
                                        className="px-2 py-1 bg-red-700 text-white hover:bg-red-600 text-xs"
                                      >
                                        확인
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2 py-1 bg-gray-600 text-white hover:bg-gray-500 text-xs"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteSet(set.id)}
                                      className="px-2 py-1 bg-red-900/50 text-white hover:bg-red-900/70 text-xs"
                                    >
                                      삭제
                                    </button>
                                  )}
                                </div>
                              </td>
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