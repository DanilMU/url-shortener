# URL Shortener (High-Performance Link Shortening Service)

Высокопроизводительный сервис сокращения ссылок на **Node.js, Express, TypeScript, PostgreSQL и Redis** с двухуровневым кэшированием, защитой от коллизий и фоновой асинхронной аналитикой переходов.

Архитектура построена по стандартам **Clean Architecture** без тяжёлых ORM (на чистом `pg` пуле с CQRS-lite разделением запросов и команд), со строгой **Fail-Fast** конфигурацией на Zod и трёхуровневой системой тестирования на **Vitest** и **Supertest**.

---

## ⚡ Ключевые архитектурные решения

* **CQRS-lite слой данных (Pure PostgreSQL)**: Запросы на чтение (`SELECT`) изолированы в `url.queries.ts`, а модифицирующие команды (`INSERT`, `UPDATE`) — в `url.commands.ts`. Репозиторий `UrlRepository` инкапсулирует SQL и наружу отдаёт строго типизированные сущности.
* **Субмиллисекундный кэш в Redis**: Доменный слой кэширования (`UrlCacheService`, `UrlCacheKeys`) с настраиваемым TTL (по умолчанию 3600 сек).
* **Асинхронный инкремент кликов (Fire-and-forget)**: При переходе по ссылке ответ `302 Found` отдаётся клиенту мгновенно из Redis (<2 мс), а инкремент кликов в PostgreSQL запускается асинхронно в фоне без блокировки HTTP-соединения.
* **Защита от коллизий**: 6-значный генератор `nanoid` с автоматическим циклом повторных попыток (до 5 попыток) при маловероятном совпадении слага.
* **Защита от бесконечных циклов**: Запрет на сокращение `localhost`, `127.0.0.1` и адреса самого сервиса.
* **Строгий Fail-Fast конфигуратор**: Переменные окружения валидируются через Zod на старте приложения. Если в `.env` отсутствует хотя бы одно обязательное поле, приложение моментально останавливается с понятным списком ошибок.
* **Clean Test Architecture**: 27 автоматизированных тестов (изолированные Unit-тесты с фабриками данных `createUrlFixture`, интеграционные тесты с реальной PostgreSQL и сквозные HTTP API тесты через Supertest).

---

## 📋 Требования к окружению

Перед запуском убедитесь, что на вашем компьютере установлены:
* **Node.js**: версия `20.x` или новее (рекомендуется `22+` или `24+`);
* **npm**: версия `10.x` или новее;
* **Docker & Docker Compose**: для запуска PostgreSQL и Redis (Docker Desktop на Windows/Mac или docker engine на Linux);
* **Git**: для клонирования репозитория.

---

## 🚀 Быстрый старт (Локальная разработка за 4 шага)

### Шаг 1. Клонирование репозитория
```bash
git clone https://github.com/DanilMU/url-shortener.git
cd url-shortener
```

### Шаг 2. Настройка переменных окружения
Скопируйте пример файла конфигурации:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS (Bash)
cp .env.example .env
```

Файл `.env` уже преднастроен для локальной работы:
```env
NODE_ENV=development
PORT=4000
BASE_URL=http://localhost:4000

# PostgreSQL
HOST_POSTGRES_PORT=5433
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=url_shortener
DATABASE_URL=postgresql://postgres:123456@localhost:5433/url_shortener

# Redis
HOST_REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL_SECONDS=3600

# Frontend
HOST_FRONTEND_PORT=3000
VITE_API_URL=http://localhost:4000
```

> **Примечание по порту PostgreSQL (5433)**: Внешний порт контейнера вынесен на `5433`, чтобы избежать конфликта с локальной службой PostgreSQL, если она уже установлена на вашей ОС на стандартном порту 5432.

---

### Шаг 3. Запуск баз данных в Docker
Поднимите контейнеры PostgreSQL и Redis в фоновом режиме:
```bash
docker compose up -d postgres redis
```

Проверьте статус контейнеров (должны быть в статусе `healthy`):
```bash
docker compose ps
```

Таблица `urls` и индекс по `short_code` создаются автоматически скриптом `backend/src/infra/sql/init.sql` при первом старте PostgreSQL.

---

### Шаг 4. Установка зависимостей и запуск бэкенда
Перейдите в директорию `backend`:
```bash
cd backend
npm install
npm run dev
```

При успешном старте в консоли появится лог подключения:
```
🚀 Starting URL Shortener Backend Service...
🌍 Environment: development
🔄 Connecting to PostgreSQL...
✅ Connected to PostgreSQL database "url_shortener" in 45ms
🔄 Redis connecting...
✅ Redis ready in 120ms (localhost:6379)
⚡ Server running at http://localhost:4000
🔗 Health check available at http://localhost:4000/health
```

---

## 🧪 Запуск автоматических тестов

В проекте настроена трёхуровневая система тестирования на базе **Vitest** и **Supertest**:

```bash
cd backend

# Запуск ВСЕХ тестов проекта (27 тестов)
npm test

# Запуск ТОЛЬКО быстрых Unit-тестов бизнес-логики (14 мс)
npm run test:unit

# Запуск ТОЛЬКО интеграционных тестов с реальной БД и HTTP API
npm run test:integration

# Проверка сборки продакшн-бандла
npm run build
```

---

## 🐳 Запуск всего проекта в Docker (Full Stack)

Для одновременного запуска всех сервисов (PostgreSQL, Redis, Backend) через Docker Compose:

```bash
docker compose up --build
```

Остановка контейнеров:
```bash
docker compose down
```

---

## 🗄️ Подключение к базе данных через GUI (DBeaver / DataGrip)

Если вам нужно просмотреть данные через графический клиент, используйте следующие реквизиты:

| Параметр | Значение |
| :--- | :--- |
| **СУБД** | PostgreSQL |
| **Host** | `localhost` или `127.0.0.1` |
| **Port** | `5433` |
| **Database** | `url_shortener` |
| **User** | `postgres` |
| **Password** | `123456` |

---

## 📡 Справочник API (Примеры запросов cURL)

### 1. Проверка работоспособности сервиса (Healthcheck)
```bash
curl -X GET http://localhost:4000/health
```
**Ответ (200 OK):**
```json
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": "2026-09-24T20:30:00.000Z"
}
```

---

### 2. Сокращение ссылки с автогенерацией кода (nanoid)
```bash
curl -X POST http://localhost:4000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/facebook/react"}'
```
**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "short_code": "DbTD_h",
    "original_url": "https://github.com/facebook/react",
    "clicks": 0,
    "created_at": "2026-09-24T20:30:00.000Z",
    "shortUrl": "http://localhost:4000/DbTD_h"
  }
}
```

---

### 3. Сокращение ссылки с кастомным слагом (customCode)
```bash
curl -X POST http://localhost:4000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://react.dev", "customCode": "react-docs"}'
```
**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "short_code": "react-docs",
    "original_url": "https://react.dev",
    "clicks": 0,
    "created_at": "2026-09-24T20:30:00.000Z",
    "shortUrl": "http://localhost:4000/react-docs"
  }
}
```

*При попытке занять уже существующий слаг вернется `409 Conflict`:*
```json
{
  "success": false,
  "message": "Short code \"react-docs\" is already taken"
}
```

---

### 4. Переход по короткой ссылке (Redirect)
Откройте ссылку в браузере или отправьте запрос:
```bash
curl -I http://localhost:4000/react-docs
```
**Ответ (302 Found):**
```http
HTTP/1.1 302 Found
Location: https://react.dev
```

---

### 5. Получение аналитики по ссылке
```bash
curl -X GET http://localhost:4000/api/stats/react-docs
```
**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "short_code": "react-docs",
    "original_url": "https://react.dev",
    "clicks": 1,
    "created_at": "2026-09-24T20:30:00.000Z",
    "shortUrl": "http://localhost:4000/react-docs"
  }
}
```

---

### 6. Получение списка последних созданных ссылок
```bash
curl -X GET "http://localhost:4000/api/urls?limit=10"
```
**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "short_code": "react-docs",
      "original_url": "https://react.dev",
      "clicks": 1,
      "created_at": "2026-09-24T20:30:00.000Z",
      "shortUrl": "http://localhost:4000/react-docs"
    },
    {
      "id": 1,
      "short_code": "DbTD_h",
      "original_url": "https://github.com/facebook/react",
      "clicks": 0,
      "created_at": "2026-09-24T20:30:00.000Z",
      "shortUrl": "http://localhost:4000/DbTD_h"
    }
  ]
}
```

---

## 📂 Структура проекта

```
url-shortener/
├── .env.example                                # Шаблон переменных окружения
├── docker-compose.yml                          # Инфраструктура (PostgreSQL, Redis, App)
├── README.md                                   # Документация проекта
└── backend/
    ├── src/                                    # Продакшн исходный код
    │   ├── config/
    │   │   ├── db.ts                          # Пул PostgreSQL с логированием
    │   │   ├── env.ts                         # Zod fail-fast конфигурация
    │   │   └── redis.ts                       # ioredis клиент с lifecycle events
    │   ├── controllers/
    │   │   └── url.controller.ts              # HTTP контроллеры с валидацией Zod
    │   ├── errors/
    │   │   └── app.error.ts                   # Доменные ошибки (400, 404, 409)
    │   ├── infra/
    │   │   ├── cache/
    │   │   │   ├── url.cache.keys.ts          # Генераторы ключей кэша
    │   │   │   └── url.cache.service.ts       # Кэширование в Redis с TTL
    │   │   └── sql/
    │   │       ├── commands/url.commands.ts   # SQL команды (INSERT, UPDATE)
    │   │       ├── queries/url.queries.ts     # SQL запросы (SELECT)
    │   │       └── init.sql                   # DDL схема базы данных
    │   ├── middlewares/
    │   │   └── error.middleware.ts            # Централизованный обработчик ошибок
    │   ├── repositories/
    │   │   └── url.repository.ts              # Доменный репозиторий
    │   ├── routes/
    │   │   └── url.routes.ts                  # Маршрутизация Express
    │   ├── services/
    │   │   └── url.service.ts                 # Бизнес-логика, nanoid, фоновые клики
    │   ├── app.ts                             # Сборка Express приложения
    │   └── server.ts                          # Bootstrap с graceful shutdown
    ├── tests/                                 # Автоматизированные тесты
    │   ├── fixtures/
    │   │   └── url.fixture.ts                 # Фабрика тестовых данных (DRY)
    │   ├── integration/
    │   │   ├── api/
    │   │   │   ├── redirect.api.test.ts       # Тесты GET /:shortCode
    │   │   │   ├── shorten.api.test.ts        # Тесты POST /api/shorten
    │   │   │   └── stats.api.test.ts          # Тесты GET /api/stats
    │   │   └── repositories/
    │   │       └── url.repository.test.ts     # Тесты SQL репозитория в PostgreSQL
    │   ├── setup/
    │   │   ├── api-test.setup.ts              # Общий сетап API
    │   │   ├── global-teardown.ts             # Централизованный teardown пулов
    │   │   └── test-db.helper.ts              # TRUNCATE таблиц перед тестами
    │   └── unit/
    │       └── services/
    │           └── url.service.spec.ts        # 13 модульных тестов логики
    ├── package.json
    ├── tsconfig.json
    └── vitest.config.mjs                      # Конфигурация Vitest
```

---

## 🛠️ Возможные проблемы и их решение (Troubleshooting)

1. **Ошибка `FATAL: password authentication failed for user "postgres"` при подключении к БД**:
   - Убедитесь, что вы вводите пароль `123456` и подключаетесь к порту `5433` (а не `5432`).
2. **Контейнер PostgreSQL не поднимается из-за занятого порта**:
   - Если порт `5433` на вашем ПК занят другим сервисом, измените значение `HOST_POSTGRES_PORT` в `.env` (например, на `5434`) и перезапустите контейнер: `docker compose up -d postgres`.
3. **Ошибки при старте `npm run dev`**:
   - Убедитесь, что контейнеры запущены и находятся в статусе `healthy`: `docker compose ps`. Приложение падает на этапе инициализации (Fail-Fast), если базы данных недоступны.
