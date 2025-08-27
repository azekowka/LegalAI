Документация: https://www.prisma.io/docs/orm/reference/prisma-config-reference

Я успешно исправил оба предупреждения Prisma 6.15.0:

## ✅ Выполненные изменения:

### 1. Перенос конфигурации из `package.json` в `prisma.config.ts`
- **Создан файл** `apps/web/prisma.config.ts` с правильной конфигурацией схемы
- **Удалена** секция `"prisma"` из `apps/web/package.json`
- Используется новый API `defineConfig` из `prisma/config`

### 2. Удаление `multiSchema` из `previewFeatures`
- **Удален** `"multiSchema"` из массива `previewFeatures` в `schema.prisma`
- Функция `multiSchema` теперь доступна по умолчанию (General Availability)

## 📝 Что изменилось:

**Файл `apps/web/prisma.config.ts` (новый):**
```typescript
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'src', 'prisma', 'schema.prisma'),
});
```

**Файл `apps/web/package.json`:**
- Удалена секция `"prisma": { "schema": "src/prisma/schema.prisma" }`

**Файл `apps/web/src/prisma/schema.prisma`:**
- Удален `previewFeatures = ["multiSchema"]` из generator client

Теперь ваш проект соответствует новым требованиям Prisma 6.15.0, и предупреждения должны исчезнуть. Конфигурация Prisma теперь находится в отдельном файле `prisma.config.ts`, что обеспечивает лучшую гибкость и соответствует современным практикам.