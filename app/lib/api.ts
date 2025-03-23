import { supabase } from './supabase';

// 날짜 형식 변환 유틸리티 함수
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 현재 사용자 ID 가져오기
const getCurrentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error('인증 세션을 확인할 수 없습니다. 다시 로그인해주세요.');
  }
  
  if (!data?.user) {
    throw new Error('로그인이 필요한 기능입니다.');
  }
  
  return data.user.id;
};

// 타입 정의
export type WorkoutType = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  created_at?: string;
  updated_at?: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  workout_date: string;
  completed: boolean;
  duration_minutes: number | null;
  created_at?: string;
  updated_at?: string;
};

export type WorkoutSet = {
  id: string;
  user_id: string;
  workout_log_id: string;
  workout_type_id: string;
  reps: number;
  weight: number;
  set_number: number;
  created_at?: string;
  updated_at?: string;
};

// 운동 종류 관련 API 함수
export const getWorkoutTypes = async () => {
  const { data, error } = await supabase
    .from('workout_types')
    .select('*')
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutType[];
};

export const addWorkoutType = async (name: string, type: string) => {
  const user_id = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('workout_types')
    .insert([{ name, type, user_id }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutType;
};

export const updateWorkoutType = async (id: string, name: string, type: string) => {
  const user_id = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('workout_types')
    .update({ name, type, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user_id) // 자신의 데이터만 수정할 수 있도록 제한
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutType;
};

export const deleteWorkoutType = async (id: string) => {
  const user_id = await getCurrentUserId();
  
  const { error } = await supabase
    .from('workout_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id); // 자신의 데이터만 삭제할 수 있도록 제한
  
  if (error) {
    throw error;
  }
  
  return true;
};

// 운동 로그 관련 API 함수
export const getWorkoutLogs = async (startDate?: Date, endDate?: Date) => {
  let query = supabase.from('workout_logs').select('*');
  
  if (startDate) {
    query = query.gte('workout_date', formatDate(startDate));
  }
  
  if (endDate) {
    query = query.lte('workout_date', formatDate(endDate));
  }
  
  const { data, error } = await query.order('workout_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutLog[];
};

export const getWorkoutLogByDate = async (date: Date) => {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('workout_date', formatDate(date))
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
    throw error;
  }
  
  return data as WorkoutLog | null;
};

export const createOrUpdateWorkoutLog = async (date: Date, completed: boolean, duration_minutes?: number) => {
  const user_id = await getCurrentUserId();
  const formattedDate = formatDate(date);
  
  // 먼저 해당 날짜의 로그가 있는지 확인
  const { data: existingLog } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('workout_date', formattedDate)
    .eq('user_id', user_id)
    .single();
  
  // 이미 있다면 업데이트, 없다면 새로 생성
  if (existingLog) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update({ 
        completed, 
        duration_minutes, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', existingLog.id)
      .eq('user_id', user_id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as WorkoutLog;
  } else {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([{ 
        workout_date: formattedDate, 
        completed, 
        duration_minutes,
        user_id
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as WorkoutLog;
  }
};

// 운동 세트 관련 API 함수
export const getWorkoutSets = async (workoutLogId: string) => {
  const { data, error } = await supabase
    .from('workout_sets')
    .select(`
      *,
      workout_type:workout_types(id, name, type)
    `)
    .eq('workout_log_id', workoutLogId)
    .order('id');
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const addWorkoutSet = async (
  workoutLogId: string,
  workoutTypeId: string,
  reps: number,
  weight: number,
  setNumber: number
) => {
  const user_id = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('workout_sets')
    .insert([{
      workout_log_id: workoutLogId,
      workout_type_id: workoutTypeId,
      reps,
      weight,
      set_number: setNumber,
      user_id
    }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutSet;
};

export const updateWorkoutSet = async (
  id: string,
  reps: number,
  weight: number
) => {
  const user_id = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('workout_sets')
    .update({ 
      reps, 
      weight, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutSet;
};

export const deleteWorkoutSet = async (id: string) => {
  const user_id = await getCurrentUserId();
  
  const { error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  
  if (error) {
    throw error;
  }
  
  return true;
}; 