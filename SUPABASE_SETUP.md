# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/) 계정에 로그인하세요.
2. 새 프로젝트를 생성하세요.
3. 프로젝트가 생성되면 "설정" > "API" 메뉴에서 URL과 anon key 값을 확인하세요.
4. 프로젝트의 `.env.local` 파일에 다음과 같이 입력하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 2. 테이블 생성

Supabase의 SQL 편집기에서 다음 SQL 쿼리를 실행하여 필요한 테이블을 생성하세요:

```sql
-- 사용자의 운동 종류를 저장하는 테이블
CREATE TABLE IF NOT EXISTS workout_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 날짜별 운동 여부와 시간을 기록하는 테이블
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_date)
);

-- 날짜별 운동이름과 세트별 중량을 기록하는 테이블
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  workout_type_id UUID NOT NULL REFERENCES workout_types(id) ON DELETE CASCADE,
  reps INTEGER NOT NULL,
  weight NUMERIC(6, 2) NOT NULL,
  set_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블의 Row Level Security(RLS) 설정
ALTER TABLE workout_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- 각 테이블에 대한 정책 설정
CREATE POLICY "Users can view their own workout types" 
  ON workout_types FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout types" 
  ON workout_types FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout types" 
  ON workout_types FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout types" 
  ON workout_types FOR DELETE 
  USING (auth.uid() = user_id);

-- workout_logs 테이블 정책
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

-- workout_sets 테이블 정책
CREATE POLICY "Users can view their own workout sets" 
  ON workout_sets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sets" 
  ON workout_sets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sets" 
  ON workout_sets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sets" 
  ON workout_sets FOR DELETE 
  USING (auth.uid() = user_id);
```

## 3. 인증 설정

1. Supabase 대시보드에서 "인증" > "제공자" 메뉴로 이동하세요.
2. 이메일/비밀번호 인증이 활성화되어 있는지 확인하세요.
3. 필요하다면 이메일 확인 설정, 비밀번호 정책 등을 조정하세요.

## 4. 시작하기

1. 앱을 시작하려면 다음 명령어를 실행하세요:

```bash
npm run dev
```

2. 웹 브라우저에서 `http://localhost:3000`으로 접속하세요.
3. 회원가입 또는 로그인 후 운동 기록을 시작하세요. 