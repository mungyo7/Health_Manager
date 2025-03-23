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

// 한글 운동 타입 매핑
const EXERCISE_TYPE_KOREAN: Record<string, string> = {
  'CHEST': '가슴',
  'BACK': '등',
  'LEGS': '하체',
  'SHOULDERS': '어깨',
  'ARMS': '팔',
  'CORE': '코어',
  'CARDIO': '유산소',
  'OTHER': '기타'
};

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
  const [newExerciseType, setNewExerciseType] = useState('CHEST'); // 기본값은 가슴으로 설정
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
    
    // 현재 선택한 운동 타입에 대한 기존 세트들을 확인
    const existingSets = workoutSets.filter(set => set.workout_type_id === exercise.id);
    
    // 마지막 세트 번호 찾기
    let lastSetNumber = 0;
    if (existingSets.length > 0) {
      lastSetNumber = Math.max(...existingSets.map(set => set.set_number));
    }
    
    const newExercise = {
      id: `temp-${Date.now()}`,
      workout_type_id: exercise.id,
      workout_type: exercise,
      exerciseName: exercise.name,
      sets: [{ weight: 0, reps: 0, set_number: lastSetNumber + 1 }]
    };
    
    setCurrentExercises([...currentExercises, newExercise]);
    setSelectedExercise(null);
    setShowExerciseForm(false);
  };

  // 세트 추가 핸들러
  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...currentExercises];
    const currentExercise = updatedExercises[exerciseIndex];
    const currentSets = currentExercise.sets;
    
    // 현재 편집 중인 운동 유형에 대한 최대 세트 번호 찾기
    let maxSetNumber = 0;
    
    // 현재 편집 중인 세트들의 최대 번호 확인
    if (currentSets.length > 0) {
      maxSetNumber = Math.max(...currentSets.map((set: any) => set.set_number));
    }
    
    // 기존에 저장된 세트도 확인
    const existingSets = workoutSets.filter(set => set.workout_type_id === currentExercise.workout_type_id);
    if (existingSets.length > 0) {
      const existingMaxSetNumber = Math.max(...existingSets.map(set => set.set_number));
      maxSetNumber = Math.max(maxSetNumber, existingMaxSetNumber);
    }
    
    updatedExercises[exerciseIndex].sets.push({ 
      weight: 0, 
      reps: 0, 
      set_number: maxSetNumber + 1 
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
        // 저장 전에 세트를 세트 번호 순으로 정렬 (순서 유지)
        exercise.sets.sort((a: any, b: any) => a.set_number - b.set_number);
        
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
    
    // 세트 번호 순으로 정렬 (기존 순서 유지)
    sameSets.sort((a, b) => a.set_number - b.set_number);
    
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
      const newExerciseTypeObj = await addWorkoutType(newExerciseName.toUpperCase(), newExerciseType);
      
      // 상태 업데이트
      setExerciseTypes([...exerciseTypes, newExerciseTypeObj]);
      
      // 입력 필드 초기화
      setNewExerciseName('');
      setNewExerciseType('CHEST'); // 기본값으로 재설정
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
    setNewExerciseType(exerciseType.type || 'OTHER');
  };
  
  // 운동 종류 수정 완료 핸들러
  const handleUpdateExerciseType = async () => {
    if (!editingExerciseType || !newExerciseName.trim()) return;
    
    try {
      setLoading(true);
      const updatedType = await updateWorkoutType(
        editingExerciseType.id,
        newExerciseName.toUpperCase(),
        newExerciseType
      );
      
      // 상태 업데이트
      const updatedExerciseTypes = exerciseTypes.map(ex => 
        ex.id === editingExerciseType.id ? updatedType : ex
      );
      
      setExerciseTypes(updatedExerciseTypes);
      
      // 입력 필드 및 편집 상태 초기화
      setNewExerciseName('');
      setNewExerciseType('CHEST');
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

  // 운동 타입별로 운동을 그룹화하는 함수
  const groupExercisesByType = (exercises: WorkoutType[]) => {
    const grouped: { [key: string]: WorkoutType[] } = {};
    
    // EXERCISE_CATEGORIES 순서대로 그룹 생성
    EXERCISE_CATEGORIES.forEach(category => {
      grouped[category] = [];
    });
    
    // 운동을 타입별로 분류
    exercises.forEach(exercise => {
      const type = exercise.type || 'OTHER';
      if (grouped[type]) {
        grouped[type].push(exercise);
      } else {
        grouped['OTHER'].push(exercise);
      }
    });
    
    // 빈 그룹 제거 (선택사항)
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });
    
    return grouped;
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
          type: exerciseType?.type,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold text-primary neon-text tracking-wider glitch-text">WORKOUT_RECORDS</h1>
        
        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border-2 border-primary/70 text-primary px-4 py-2 focus:outline-none focus:border-primary/100 focus:ring-1 focus:ring-primary/50 shadow-[0_0_8px_rgba(0,255,255,0.3)] rounded-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-primary animate-pulse"></div>
          </div>
          
          <button
            onClick={toggleManageExercises}
            className="w-full sm:w-auto text-black bg-primary hover:bg-primary/90 px-6 py-2 font-bold uppercase tracking-wider border border-primary shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.7)]"
          >
            {showManageExercises ? 'RETURN_TO_RECORDS' : 'MANAGE_EXERCISES'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-300 bg-red-900/30 border border-red-500/50 rounded-sm shadow-[0_0_10px_rgba(255,0,0,0.1)]">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="flex items-center space-x-3 text-primary">
            <div className="h-4 w-4 bg-primary animate-ping"></div>
            <div className="text-lg uppercase tracking-wider">LOADING_DATA...</div>
          </div>
        </div>
      )}
      
      {/* 운동 종류 관리 섹션 */}
      {showManageExercises ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">EXERCISE_DATABASE</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
          
          {/* 운동 종류 추가 폼 */}
          <div className="p-6 border-2 border-primary/50 bg-gray-900/80 shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-sm">
            <h3 className="text-lg font-bold mb-4 text-primary uppercase tracking-wider">
              {editingExerciseType ? 'MODIFY_EXERCISE' : 'ADD_NEW_EXERCISE'}
            </h3>
            
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="EXERCISE_NAME"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full bg-black border-2 border-primary/70 text-primary px-4 py-3 focus:outline-none focus:border-primary/100 focus:ring-1 focus:ring-primary/50 shadow-[0_0_8px_rgba(0,255,255,0.2)]"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-primary animate-pulse"></div>
              </div>
              
              {editingExerciseType ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateExerciseType}
                    disabled={loading || !newExerciseName.trim()}
                    className="px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
                  >
                    UPDATE
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingExerciseType(null);
                      setNewExerciseName('');
                    }}
                    className="px-6 py-3 border-2 border-primary/70 text-primary font-bold uppercase tracking-wider hover:bg-primary/10 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddExerciseType}
                  disabled={loading || !newExerciseName.trim()}
                  className="px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
                >
                  ADD
                </button>
              )}
            </div>
          </div>
          
          {/* 운동 종류 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {exerciseTypes.length === 0 ? (
              <div className="text-center p-4 text-gray-400">
                데이터베이스에 등록된 운동이 없습니다. 새 운동을 추가하세요.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupExercisesByType(exerciseTypes)).map(([type, exercises]) => (
                  <div key={type} className="space-y-2">
                    <h4 className="text-primary text-sm font-bold bg-primary/10 p-2 sticky top-0">
                      {EXERCISE_TYPE_KOREAN[type]} ({exercises.length})
                    </h4>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/30">
                          <th className="p-2 text-left text-xs text-primary uppercase">운동 이름</th>
                          <th className="p-2 text-right text-xs text-primary uppercase">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {exercises.map((type) => (
                          <tr key={type.id} className="hover:bg-primary/5">
                            <td className="p-2 text-white">{type.name}</td>
                            <td className="p-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handlePrepareEditExerciseType(type)}
                                  className="px-2 py-0.5 text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors duration-200 rounded-sm"
                                >
                                  수정
                                </button>
                                
                                {deleteExerciseTypeId === type.id ? (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={confirmDeleteExerciseType}
                                      className="px-2 py-0.5 text-xs bg-red-900/70 text-red-300 border border-red-500/30 hover:bg-red-800 transition-colors duration-200 rounded-sm"
                                    >
                                      확인
                                    </button>
                                    <button
                                      onClick={() => setDeleteExerciseTypeId(null)}
                                      className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors duration-200 rounded-sm"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteExerciseType(type.id)}
                                    className="px-2 py-0.5 text-xs bg-red-800/30 text-red-400 border border-red-500/30 hover:bg-red-800/50 transition-colors duration-200 rounded-sm"
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
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 운동 기록 섹션 */
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{formattedDate}</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          </div>
          
          {/* 새 운동 추가 폼 */}
          <div id="edit-form" className="p-6 border-2 border-primary/50 bg-gray-900/80 shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-sm">
            <h3 className="text-lg font-bold mb-4 text-primary uppercase tracking-wider">
              {editingSetId ? 'EDIT_WORKOUT_SET' : 'ADD_NEW_WORKOUT'}
            </h3>
            
            {/* 운동 선택 */}
            {!selectedExercise && currentExercises.length === 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary uppercase tracking-wider mb-2">SELECT_EXERCISE</label>
                
                {loading ? (
                  <div className="text-gray-400">운동 종류를 불러오는 중...</div>
                ) : exerciseTypes.length === 0 ? (
                  <div className="text-gray-400">저장된 운동 종류가 없습니다.</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupExercisesByType(exerciseTypes)).map(([type, exercises]) => (
                      <div key={type} className="space-y-2">
                        <h4 className="text-primary text-sm font-bold border-b border-primary/30 pb-1 mb-2">
                          {EXERCISE_TYPE_KOREAN[type]} ({exercises.length})
                        </h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {exercises.map((exercise) => (
                            <button
                              key={exercise.id}
                              onClick={() => handleExerciseSelect(exercise.id)}
                              className="text-center h-10 px-2 py-1.5 bg-black border border-primary/30 rounded-sm text-sm hover:border-primary/70 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-[0_0_5px_rgba(0,255,255,0.1)] hover:shadow-[0_0_8px_rgba(0,255,255,0.2)] flex items-center justify-center"
                            >
                              {exercise.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* 선택한 운동 */}
            {showExerciseForm && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 p-3 border border-primary/20 bg-primary/5 shadow-inner">
                <div className="flex-shrink overflow-hidden mb-3 sm:mb-0">
                  <span className="text-primary text-sm uppercase tracking-wider">SELECTED:</span>
                  <span className="ml-2 text-white font-bold truncate block sm:inline-block">
                    {exerciseTypes.find(ex => ex.id === selectedExercise)?.name}
                  </span>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button
                    onClick={handleAddExercise}
                    className="flex-1 sm:flex-none min-w-20 px-4 py-2 bg-primary text-black font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-300"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExercise(null);
                      setShowExerciseForm(false);
                    }}
                    className="flex-1 sm:flex-none min-w-20 px-4 py-2 border border-primary/50 text-primary uppercase tracking-wider text-sm hover:bg-primary/10 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
            
            {/* 세트 정보 입력 */}
            {currentExercises.length > 0 && (
              <div className="space-y-5">
                {currentExercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id} className="border-2 border-primary/30 p-4 bg-black/40 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-primary/20">
                      <h4 className="font-bold text-primary">{exercise.exerciseName}</h4>
                      <button
                        onClick={() => handleAddSet(exerciseIndex)}
                        className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors duration-200 uppercase tracking-wider text-xs flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        ADD_SET
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">SET</th>
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">WEIGHT (KG)</th>
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">REPS</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {exercise.sets.map((set: {weight: number, reps: number, set_number: number, id?: string}, setIndex: number) => (
                            <tr key={set.id || setIndex} className="hover:bg-primary/5">
                              <td className="p-2 font-mono text-primary">{set.set_number}</td>
                              <td className="p-2">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(
                                      exerciseIndex,
                                      setIndex,
                                      'weight',
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-24 bg-black border border-primary/40 p-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  />
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-1.5 w-1.5 bg-primary/70 animate-pulse"></div>
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(
                                      exerciseIndex,
                                      setIndex,
                                      'reps',
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="w-24 bg-black border border-primary/40 p-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  />
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-1.5 w-1.5 bg-primary/70 animate-pulse"></div>
                                </div>
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                  className="text-red-400 hover:text-red-300 flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs uppercase tracking-wider">REMOVE</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-2 border-2 border-primary/50 text-primary uppercase tracking-wider font-bold hover:bg-primary/10 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveWorkout}
                    disabled={savingWorkout}
                    className="px-5 py-2 bg-primary text-black uppercase tracking-wider font-bold disabled:opacity-50 hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
                  >
                    {savingWorkout ? 'SAVING...' : (editingSetId ? 'UPDATE' : 'SAVE')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 저장된 운동 기록 목록 */}
          <div className="mt-8">
            <div className="flex items-center space-x-3 mb-4">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider">TODAY'S_RECORDS</h3>
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
            
            {groupedExercises.length === 0 ? (
              <div className="text-center py-12 border-2 border-primary/20 bg-black/70 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                <div className="text-gray-400 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm uppercase tracking-wider">NO_WORKOUT_RECORDS_FOUND</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedExercises.map((exercise) => (
                  <div key={exercise.workout_type_id} className="p-5 border-2 border-primary/20 bg-black/70 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                    <div className="mb-3 pb-2 border-b border-primary/20 flex justify-between items-center">
                      <h4 className="font-bold text-primary">{exercise.name}</h4>
                      {exercise.type && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          {EXERCISE_TYPE_KOREAN[exercise.type] || exercise.type}
                        </span>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">SET</th>
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">WEIGHT (KG)</th>
                            <th className="p-2 text-left text-xs text-primary uppercase tracking-wider">REPS</th>
                            <th className="p-2 text-right text-xs text-primary uppercase tracking-wider">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {exercise.sets.map((set: any) => (
                            <tr key={set.id} className="hover:bg-primary/5 transition-colors duration-150">
                              <td className="p-2 font-mono text-primary/80">{set.set_number}</td>
                              <td className="p-2 text-white">{set.weight}</td>
                              <td className="p-2 text-white">{set.reps}</td>
                              <td className="p-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditSet(set)}
                                    className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors duration-200 uppercase tracking-wider text-xs flex items-center"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    EDIT
                                  </button>
                                  
                                  {deleteConfirmId === set.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => confirmDeleteSet(set.id)}
                                        className="px-2 py-1 bg-red-900/70 text-red-300 border border-red-500/30 hover:bg-red-800 transition-colors duration-200 uppercase tracking-wider text-xs flex items-center"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        YES
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2 py-1 bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors duration-200 uppercase tracking-wider text-xs flex items-center"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        NO
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteSet(set.id)}
                                      className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50 transition-colors duration-200 uppercase tracking-wider text-xs flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      DEL
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
      
      <div className="mt-8 flex justify-center">
        <Link 
          href="/" 
          className="px-6 py-3 border-2 border-primary text-primary hover:bg-primary/10 uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          RETURN_TO_CALENDAR
        </Link>
      </div>
      
      {/* 운동 종류 관리 모달 */}
      {showManageExercises && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-70" onClick={toggleManageExercises}></div>
          <div className="relative z-10 bg-black border-2 border-primary p-6 shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold text-primary mb-5 uppercase tracking-wider">운동 종류 관리</h2>
            
            <div className="mb-6">
              <h3 className="text-white text-lg mb-3">{editingExerciseType ? '운동 수정' : '새 운동 추가'}</h3>
              <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    placeholder="운동 이름 입력"
                    className="w-full bg-black border border-primary/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <select
                    value={newExerciseType}
                    onChange={(e) => setNewExerciseType(e.target.value)}
                    className="w-full bg-black border border-primary/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {EXERCISE_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {EXERCISE_TYPE_KOREAN[category]} ({category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={editingExerciseType ? handleUpdateExerciseType : handleAddExerciseType}
                    disabled={loading || !newExerciseName.trim()}
                    className="w-full md:w-auto px-5 py-3 bg-primary text-black font-bold disabled:opacity-50 hover:shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
                  >
                    {loading ? '처리 중...' : (editingExerciseType ? '수정' : '추가')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {exerciseTypes.length === 0 ? (
                <div className="text-center p-4 text-gray-400">
                  데이터베이스에 등록된 운동이 없습니다. 새 운동을 추가하세요.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupExercisesByType(exerciseTypes)).map(([type, exercises]) => (
                    <div key={type} className="space-y-2">
                      <h4 className="text-primary text-sm font-bold bg-primary/10 p-2 sticky top-0">
                        {EXERCISE_TYPE_KOREAN[type]} ({exercises.length})
                      </h4>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-primary/30">
                            <th className="p-2 text-left text-xs text-primary uppercase">운동 이름</th>
                            <th className="p-2 text-right text-xs text-primary uppercase">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {exercises.map((type) => (
                            <tr key={type.id} className="hover:bg-primary/5">
                              <td className="p-2 text-white">{type.name}</td>
                              <td className="p-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handlePrepareEditExerciseType(type)}
                                    className="px-2 py-0.5 text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors duration-200 rounded-sm"
                                  >
                                    수정
                                  </button>
                                  
                                  {deleteExerciseTypeId === type.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={confirmDeleteExerciseType}
                                        className="px-2 py-0.5 text-xs bg-red-900/70 text-red-300 border border-red-500/30 hover:bg-red-800 transition-colors duration-200 rounded-sm"
                                      >
                                        확인
                                      </button>
                                      <button
                                        onClick={() => setDeleteExerciseTypeId(null)}
                                        className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors duration-200 rounded-sm"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteExerciseType(type.id)}
                                      className="px-2 py-0.5 text-xs bg-red-800/30 text-red-400 border border-red-500/30 hover:bg-red-800/50 transition-colors duration-200 rounded-sm"
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
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 text-right">
              <button
                onClick={toggleManageExercises}
                className="px-4 py-2 border border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 