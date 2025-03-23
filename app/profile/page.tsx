'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProfileData {
  username?: string | null;
  height?: number | null;
  weight?: number | null;
  goals?: string | null;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: null,
    height: null,
    weight: null,
    goals: null,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchProfile();
      fetchMonthlyWorkoutCount();
    }
  }, [user, isLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        // console.error('프로필 정보를 가져오는데 실패했습니다:', error);
        // 오류 발생 시 빈 값으로 초기화
        setProfileData({
          username: null,
          height: null,
          weight: null,
          goals: null,
        });
      } else if (data) {
        setProfileData({
          username: data.username || null,
          height: data.height || null,
          weight: null,
          goals: data.goals || null,
        });
      }
    } catch (error) {
      console.error('프로필 정보를 가져오는 중 오류 발생:', error);
      // 오류 발생 시 빈 값으로 초기화
      setProfileData({
        username: null,
        height: null,
        weight: null,
        goals: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyWorkoutCount = async () => {
    if (!user) return;
    
    try {
      // 현재 월의 시작일과 끝일 구하기
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { count, error } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: false })
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (error) {
        console.error('이번달 운동 횟수를 가져오는데 실패했습니다:', error);
        setWorkoutCount(0);
      } else {
        setWorkoutCount(count || 0);
      }
    } catch (error) {
      console.error('이번달 운동 횟수를 가져오는 중 오류 발생:', error);
      setWorkoutCount(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: ['height', 'weight'].includes(name) 
        ? (value ? parseFloat(value) : null) 
        : (value || null),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          username: profileData.username || '',
          height: profileData.height || 0,
          weight: profileData.weight || 0,
          goals: profileData.goals || '',
          updated_at: new Date(),
        });

      if (error) {
        console.error('프로필 업데이트 중 오류 발생:', error);
        alert('프로필 저장에 실패했습니다.');
      } else {
        alert('프로필이 성공적으로 저장되었습니다.');
      }
    } catch (error) {
      console.error('프로필 저장 중 오류 발생:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-primary text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8 neon-text">MY PROFILE</h1>
      
      <div className="cyber-container p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                닉네임
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username || ''}
                onChange={handleChange}
                className="w-full bg-black border border-primary/50 focus:border-primary rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="닉네임을 입력하세요"
              />
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-white mb-1">
                  키 (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={profileData.height ?? ''}
                  onChange={handleChange}
                  className="w-full bg-black border border-primary/50 focus:border-primary rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="키를 입력하세요"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-white mb-1">
                  몸무게 (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={profileData.weight ?? ''}
                  onChange={handleChange}
                  className="w-full bg-black border border-primary/50 focus:border-primary rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="몸무게를 입력하세요"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-primary/10 border border-primary/30 rounded-md p-4 flex items-center justify-between">
                <span className="text-lg font-medium text-white">이번달 운동 횟수</span>
                <span className="text-2xl font-bold text-primary">{workoutCount}일</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="goals" className="block text-sm font-medium text-white mb-1">
                목표 및 다짐
              </label>
              <textarea
                id="goals"
                name="goals"
                value={profileData.goals || ''}
                onChange={handleChange}
                rows={4}
                className="w-full bg-black border border-primary/50 focus:border-primary rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="운동 목표나 다짐을 입력하세요"
              />
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-black font-medium rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '프로필 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 