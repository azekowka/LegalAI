-- SQL запрос для создания таблицы waitlist в Supabase

-- Создание таблицы waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создание индекса для быстрого поиска по email
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Создание индекса для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at);

-- Включение Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (позволяет всем читать количество записей)
CREATE POLICY "Allow public read access" ON public.waitlist
    FOR SELECT
    USING (true);

-- Политика для вставки (позволяет всем добавлять новые записи)
CREATE POLICY "Allow public insert access" ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE public.waitlist IS 'Таблица для хранения email адресов пользователей в списке ожидания';
COMMENT ON COLUMN public.waitlist.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN public.waitlist.email IS 'Email адрес пользователя (уникальный)';
COMMENT ON COLUMN public.waitlist.created_at IS 'Дата и время добавления в список ожидания';