-- workout_logs 테이블에 RLS 활성화
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (있는 경우)
DROP POLICY IF EXISTS "Users can view their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update their own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete their own workout logs" ON workout_logs;

-- 새로운 정책 생성
CREATE POLICY "Users can view their own workout logs" 
  ON workout_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs" 
  ON workout_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs" 
  ON workout_logs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs" 
  ON workout_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- INSERT 트리거 함수 생성 (user_id 자동 설정)
CREATE OR REPLACE FUNCTION public.set_workout_log_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INSERT 트리거 설정
DROP TRIGGER IF EXISTS set_workout_log_user_id_trigger ON workout_logs;
CREATE TRIGGER set_workout_log_user_id_trigger
BEFORE INSERT ON workout_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_workout_log_user_id(); 