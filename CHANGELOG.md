# Changelog

Все важные изменения в этом проекте будут документированы в этом файле.

## [Unreleased]

### Added
- Интеграция с Supabase для waitlist функциональности
- Добавлен @supabase/supabase-js в зависимости
- Создан Supabase клиент в /lib/supabase.ts
- Добавлен хук useWaitlist для работы с базой данных
- Валидация email адресов с помощью Zod
- Динамическое отображение количества пользователей в waitlist
- Обработка ошибок и уведомления пользователя
- SQL скрипт для создания таблицы waitlist в Supabase
- Переменные окружения для Supabase в .env.example
- Индикатор статуса API в footer с автоматической проверкой каждые 30 секунд
- Компонент HealthStatus для отображения состояния backend API
- Health check endpoint в tRPC роутере

### Fixed
- Исправлена работа theme toggle в header - добавлен ThemeProvider в layout.tsx
- Теперь переключение между светлой и темной темой работает корректно
- Исправлена настройка tRPC клиента для корректной работы с React hooks
- Обновлен tRPC Provider в компоненте Providers для правильной инициализации
- Исправлена совместимость API routes с Next.js 15 - обновлены типы params в динамических маршрутах
- Обновлены обработчики в /api/documents/[id]/access/route.ts и /api/documents/[id]/star/route.ts для работы с Promise<params>
- Исправлена совместимость с AI SDK - заменен метод toDataStreamResponse() на toTextStreamResponse() в chat API
- Исправлены типы API клиента для getRecentDocuments и getStarredDocuments - теперь возвращают правильную структуру с documents и count
- Добавлен недостающий импорт NextResponse в chat API route
- Исправлена ошибка типизации toggleStarDocument - добавлен правильный тип возвращаемого значения
- Добавлена поддержка optional chaining для безопасного доступа к response.data?.starred
- Установлены недостающие зависимости: @types/react-syntax-highlighter, @radix-ui/react-select
- Добавлены недостающие UI компоненты: hover-card, carousel с экспортом useCarousel
- Исправлены типы в inline-citation компоненте для совместимости с Badge

### Changed
- Полностью переработан компонент WaitlistForm с функциональностью Supabase
- Добавлена проверка на дублирование email адресов
- Улучшен UX с состояниями загрузки и обратной связью
- Переведен интерфейс waitlist с русского на английский язык
- Заменена иконка Contributors на анимированную иконку Languages в header