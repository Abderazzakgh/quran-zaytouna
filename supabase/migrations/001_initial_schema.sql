-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Enable Row Level Security

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKMARKS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS bookmark_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL,
  surah_name TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  ayah_text TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(bookmark_id, tag)
);

-- ============================================
-- READING TRACKER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  pages_read INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  juz_number INTEGER,
  start_page INTEGER,
  end_page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS reading_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  daily_pages_goal INTEGER DEFAULT 5,
  weekly_pages_goal INTEGER DEFAULT 35,
  monthly_pages_goal INTEGER DEFAULT 150,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS khatma_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  target_days INTEGER,
  pages_per_day INTEGER,
  total_pages INTEGER DEFAULT 604,
  pages_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS khatma_daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  khatma_id UUID REFERENCES khatma_history(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  pages_read INTEGER DEFAULT 0,
  target_pages INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(khatma_id, day_number)
);

-- ============================================
-- MEMORIZATION TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS memorization_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_name TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  start_ayah INTEGER NOT NULL,
  end_ayah INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'review')),
  priority INTEGER DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memorization_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES memorization_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ayahs_memorized INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memorization_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES memorization_plans(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  next_review_date DATE NOT NULL,
  review_count INTEGER DEFAULT 1,
  mastery_level INTEGER DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- ============================================
-- QUIZ TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS quiz_questions_answered (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  selected_answer TEXT,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  explanation TEXT
);

-- ============================================
-- TADABBUR TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS tadabbur_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_name TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  ayah_text TEXT NOT NULL,
  personal_reflection TEXT NOT NULL,
  selected_prompt_index INTEGER,
  tags TEXT[],
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI ASSISTANT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY VERSE TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS daily_verse_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  liked_verses JSONB DEFAULT '[]'::jsonb,
  viewed_dates JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- PRAYER TIMES TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_times_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city TEXT,
  country TEXT,
  calculation_method TEXT DEFAULT 'MWL',
  timezone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- AUDIO PLAYER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS reciters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  narrative TEXT DEFAULT 'قالون عن نافع',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surah_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reciter_id UUID REFERENCES reciters(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  UNIQUE(reciter_id, surah_number)
);

CREATE TABLE IF NOT EXISTS audio_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reciter_id UUID REFERENCES reciters(id) ON DELETE CASCADE,
  reciter_name TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reciter_id, surah_number)
);

CREATE TABLE IF NOT EXISTS audio_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES audio_playlists(id) ON DELETE CASCADE,
  reciter_id UUID REFERENCES reciters(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STATS TABLE (for aggregated data)
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_pages_read INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  ayahs_memorized INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  quiz_score_avg DECIMAL(5, 2),
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stat_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder_id ON bookmarks(folder_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_khatma_history_user_status ON khatma_history(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memorization_plans_user_status ON memorization_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tadabbur_notes_user_id ON tadabbur_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_date ON user_stats(user_id, stat_date);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatma_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatma_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorization_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorization_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions_answered ENABLE ROW LEVEL SECURITY;
ALTER TABLE tadabbur_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_verse_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Generic policy function for user-owned tables
CREATE OR REPLACE FUNCTION user_owns_record(user_id_col UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = user_id_col;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply policies to all user-owned tables
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'bookmark_folders', 'bookmarks',
    'reading_sessions', 'reading_goals', 'khatma_history',
    'memorization_plans', 'achievements',
    'quiz_results', 'tadabbur_notes',
    'ai_conversations', 'daily_verse_preferences', 
    'prayer_times_preferences', 'audio_favorites', 
    'audio_playlists', 'notifications', 'user_stats'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Users can select own %1$s" ON %1$I;
      CREATE POLICY "Users can select own %1$s" ON %1$I FOR SELECT USING (user_owns_record(user_id));
      
      DROP POLICY IF EXISTS "Users can insert own %1$s" ON %1$I;
      CREATE POLICY "Users can insert own %1$s" ON %1$I FOR INSERT WITH CHECK (user_owns_record(user_id));
      
      DROP POLICY IF EXISTS "Users can update own %1$s" ON %1$I;
      CREATE POLICY "Users can update own %1$s" ON %1$I FOR UPDATE USING (user_owns_record(user_id));
      
      DROP POLICY IF EXISTS "Users can delete own %1$s" ON %1$I;
      CREATE POLICY "Users can delete own %1$s" ON %1$I FOR DELETE USING (user_owns_record(user_id));
    ', table_name);
  END LOOP;
END $$;

-- Special policies for tables with different user_id column names
DROP POLICY IF EXISTS "Users can select own ai_messages" ON ai_messages;
CREATE POLICY "Users can select own ai_messages" ON ai_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own ai_messages" ON ai_messages;
CREATE POLICY "Users can insert own ai_messages" ON ai_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own ai_messages" ON ai_messages;
CREATE POLICY "Users can update own ai_messages" ON ai_messages FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own ai_messages" ON ai_messages;
CREATE POLICY "Users can delete own ai_messages" ON ai_messages FOR DELETE 
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own audio_playlist_items" ON audio_playlist_items;
CREATE POLICY "Users can select own audio_playlist_items" ON audio_playlist_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM audio_playlists WHERE id = audio_playlist_items.playlist_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own audio_playlist_items" ON audio_playlist_items;
CREATE POLICY "Users can insert own audio_playlist_items" ON audio_playlist_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM audio_playlists WHERE id = audio_playlist_items.playlist_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own audio_playlist_items" ON audio_playlist_items;
CREATE POLICY "Users can update own audio_playlist_items" ON audio_playlist_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM audio_playlists WHERE id = audio_playlist_items.playlist_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own audio_playlist_items" ON audio_playlist_items;
CREATE POLICY "Users can delete own audio_playlist_items" ON audio_playlist_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM audio_playlists WHERE id = audio_playlist_items.playlist_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own quiz_questions_answered" ON quiz_questions_answered;
CREATE POLICY "Users can select own quiz_questions_answered" ON quiz_questions_answered FOR SELECT 
  USING (EXISTS (SELECT 1 FROM quiz_results WHERE id = quiz_questions_answered.quiz_result_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own quiz_questions_answered" ON quiz_questions_answered;
CREATE POLICY "Users can insert own quiz_questions_answered" ON quiz_questions_answered FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM quiz_results WHERE id = quiz_questions_answered.quiz_result_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own quiz_questions_answered" ON quiz_questions_answered;
CREATE POLICY "Users can update own quiz_questions_answered" ON quiz_questions_answered FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM quiz_results WHERE id = quiz_questions_answered.quiz_result_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own quiz_questions_answered" ON quiz_questions_answered;
CREATE POLICY "Users can delete own quiz_questions_answered" ON quiz_questions_answered FOR DELETE 
  USING (EXISTS (SELECT 1 FROM quiz_results WHERE id = quiz_questions_answered.quiz_result_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own khatma_daily_progress" ON khatma_daily_progress;
CREATE POLICY "Users can select own khatma_daily_progress" ON khatma_daily_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM khatma_history WHERE id = khatma_daily_progress.khatma_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own khatma_daily_progress" ON khatma_daily_progress;
CREATE POLICY "Users can insert own khatma_daily_progress" ON khatma_daily_progress FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM khatma_history WHERE id = khatma_daily_progress.khatma_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own khatma_daily_progress" ON khatma_daily_progress;
CREATE POLICY "Users can update own khatma_daily_progress" ON khatma_daily_progress FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM khatma_history WHERE id = khatma_daily_progress.khatma_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own khatma_daily_progress" ON khatma_daily_progress;
CREATE POLICY "Users can delete own khatma_daily_progress" ON khatma_daily_progress FOR DELETE 
  USING (EXISTS (SELECT 1 FROM khatma_history WHERE id = khatma_daily_progress.khatma_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own memorization_sessions" ON memorization_sessions;
CREATE POLICY "Users can select own memorization_sessions" ON memorization_sessions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_sessions.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own memorization_sessions" ON memorization_sessions;
CREATE POLICY "Users can insert own memorization_sessions" ON memorization_sessions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_sessions.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own memorization_sessions" ON memorization_sessions;
CREATE POLICY "Users can update own memorization_sessions" ON memorization_sessions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_sessions.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own memorization_sessions" ON memorization_sessions;
CREATE POLICY "Users can delete own memorization_sessions" ON memorization_sessions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_sessions.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own memorization_reviews" ON memorization_reviews;
CREATE POLICY "Users can select own memorization_reviews" ON memorization_reviews FOR SELECT 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_reviews.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own memorization_reviews" ON memorization_reviews;
CREATE POLICY "Users can insert own memorization_reviews" ON memorization_reviews FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_reviews.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own memorization_reviews" ON memorization_reviews;
CREATE POLICY "Users can update own memorization_reviews" ON memorization_reviews FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_reviews.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own memorization_reviews" ON memorization_reviews;
CREATE POLICY "Users can delete own memorization_reviews" ON memorization_reviews FOR DELETE 
  USING (EXISTS (SELECT 1 FROM memorization_plans WHERE id = memorization_reviews.plan_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can select own bookmark_tags" ON bookmark_tags;
CREATE POLICY "Users can select own bookmark_tags" ON bookmark_tags FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bookmarks WHERE id = bookmark_tags.bookmark_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own bookmark_tags" ON bookmark_tags;
CREATE POLICY "Users can insert own bookmark_tags" ON bookmark_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM bookmarks WHERE id = bookmark_tags.bookmark_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own bookmark_tags" ON bookmark_tags;
CREATE POLICY "Users can update own bookmark_tags" ON bookmark_tags FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM bookmarks WHERE id = bookmark_tags.bookmark_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete own bookmark_tags" ON bookmark_tags;
CREATE POLICY "Users can delete own bookmark_tags" ON bookmark_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM bookmarks WHERE id = bookmark_tags.bookmark_id AND user_id = auth.uid()));

-- Reciters and Audio Catalog are public read
DROP POLICY IF EXISTS "Anyone can view reciters" ON reciters;
CREATE POLICY "Anyone can view reciters" ON reciters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view surah_audio" ON surah_audio;
CREATE POLICY "Anyone can view surah_audio" ON surah_audio FOR SELECT USING (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmark_folders_updated_at ON bookmark_folders;
CREATE TRIGGER update_bookmark_folders_updated_at BEFORE UPDATE ON bookmark_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmarks_updated_at ON bookmarks;
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_khatma_history_updated_at ON khatma_history;
CREATE TRIGGER update_khatma_history_updated_at BEFORE UPDATE ON khatma_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memorization_plans_updated_at ON memorization_plans;
CREATE TRIGGER update_memorization_plans_updated_at BEFORE UPDATE ON memorization_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audio_playlists_updated_at ON audio_playlists;
CREATE TRIGGER update_audio_playlists_updated_at BEFORE UPDATE ON audio_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tadabbur_notes_updated_at ON tadabbur_notes;
CREATE TRIGGER update_tadabbur_notes_updated_at BEFORE UPDATE ON tadabbur_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO reciters (name, bio, narrative) VALUES 
('الشيخ علي البراق', 'سيد القراء التونسيين، تميز بإتقانه لمقامات القراءة التونسية الأصيلة.', 'قالون عن نافع'),
('الشيخ محمد المشفر', 'من أبرز القراء التونسيين المعاصرين، له جهود كبيرة في تعليم الرواية.', 'قالون عن نافع'),
('الشيخ حسن الورغي', 'صوت مميز من جامع الزيتونة المعمور.', 'قالون عن نافع'),
('أبو عبد الله منير المظفر', 'قارئ تونسي متميز بجودة التلاوة وإتقان الأحكام.', 'قالون عن نافع'),
('جوهر القردلي', 'من الأصوات التونسية الشابة والمتميزة في تلاوة القرآن الكريم.', 'قالون عن نافع'),
('العربي الكثيري', 'قارئ ومقرئ تونسي معروف بتواضعه وعذوبة صوته.', 'قالون عن نافع'),
('محمد أبو سنينة', 'من القراء التونسيين الذين ساهموا في نشر رواية قالون.', 'قالون عن نافع'),
('عبد المانع السعداوي', 'قارئ يتميز بأسلوب خاص وطابع تونسي فريد في الأداء.', 'قالون عن نافع')
ON CONFLICT DO NOTHING;

