import { supabase } from './supabase';

// 날짜 형식 변환 유틸리티 함수
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 타입 정의
export type WorkoutType = {
  id: string;
  user_id: string;
  name: string;
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

export const addWorkoutType = async (name: string) => {
  const { data, error } = await supabase
    .from('workout_types')
    .insert([{ name }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutType;
};

export const updateWorkoutType = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('workout_types')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutType;
};

export const deleteWorkoutType = async (id: string) => {
  const { error } = await supabase
    .from('workout_types')
    .delete()
    .eq('id', id);
  
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
  const formattedDate = formatDate(date);
  
  // 먼저 해당 날짜의 로그가 있는지 확인
  const { data: existingLog } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('workout_date', formattedDate)
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
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as WorkoutLog;
  } else {
    // user_id는 RLS를 통해 자동으로 설정됩니다 (auth.uid())
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([{ 
        workout_date: formattedDate, 
        completed, 
        duration_minutes
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
      workout_types(id, name)
    `)
    .eq('workout_log_id', workoutLogId)
    .order('created_at');
  
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
  const { data, error } = await supabase
    .from('workout_sets')
    .insert([{
      workout_log_id: workoutLogId,
      workout_type_id: workoutTypeId,
      reps,
      weight,
      set_number: setNumber
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
  const { data, error } = await supabase
    .from('workout_sets')
    .update({ 
      reps, 
      weight, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as WorkoutSet;
};

export const deleteWorkoutSet = async (id: string) => {
  const { error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
  
  return true;
}; 