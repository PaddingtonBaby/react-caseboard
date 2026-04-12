<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![ReactFlow](https://img.shields.io/badge/ReactFlow-FF6B6B?style=flat&logo=react&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=flat&logo=redux&logoColor=white)

</div>

<img width="1919" height="957" alt="image" src="https://github.com/user-attachments/assets/5b229d8e-774e-45f8-be67-2a3fb7898e4c" />

## Возможности

- Канва с добавлением карточек разных типов (фотографии, заметки, локация, улика, др.)
- Возможность определения связей между карточками
- Локальное сохранение данных (IndexedDB) - работает из коробки, без бекенда
- Подключение к бекенду через переменную окружения - без изменения кода фронтенда
- Импорт и экспорт расследований (json)

## Технологии

- React + TypeScript  
- Vite  
- Tailwind CSS  
- React Flow  
- Zustand  

## Быстрый старт

```bash
npm install
npm run dev
```

По умолчанию данные сохраняются локально в браузере (IndexedDB через LocalForage). Бекенд не требуется.

## Сборка для прода
```bash
npm run build
```

## Подключение бекенда

```env
VITE_API_URL=https://your-api.example.com
```

Фронтенд переключится с локального хранения на API автоматически. Нужны три эндпоинта: `GET /cases`, `PUT /cases/:id`, `DELETE /cases/:id`. Тело PUT - объект `Case` целиком.

### Реализация своего адаптера

Хранение реализовано через интерфейс `StorageAdapter` (`src/storage/StorageAdapter.ts`). Достаточно реализовать четыре метода: `loadAll`, `saveCase`, `removeCase`, `generateCaseId` - и вернуть новый адаптер из `src/storage/createAdapter.ts`.

## Схема экспорта

Файл экспорта содержит версию схемы в поле `schemaVersion`. При импорте схема валидируется - если формат слишком старый или повреждён, загрузка не пройдёт. Это нужно, чтобы не сломать данные при переезде между версиями.

```json
{
  "schemaVersion": 1,
  "exportedAt": 1712345678,
  "case": { "...": "..." }
}
```

Старые экспорты (без `schemaVersion`) распознаются как v0 и конвертируются автоматически.

---

## О проекте

Изначально я делал это как UI-оболочку - посмотреть, как выглядит, потрогать React Flow. Я занимаюсь преимущественно фронтенд-правками, а TypeScript для меня относительно новый стек, так что задача была просто сделать что-нибудь рабочее.

Потом решил, что раз уж сделал - надо и данные нормально хранить. Поэтому появился IndexedDB, опциональный API.

Это локальный инструмент для детективов на фулл РП проектах.

Раньше играл в SAMP, там всё крутится вокруг phpbb-форумов - после расследования нужно было как-то оформить результат и выложить. Под это нужна возможность выгрузить кейс-файл в читаемый текст или BB-код, чтобы скинуть на форум. Это ещё не реализовано, но пока думаю о том, как сделать "выгрузку".

Сейчас планирую переходить на GTA V, и там уже интереснее - можно попробовать iframe на форум прокинуть или какую-то другую интеграцию, чтобы не просто скрин или фоточку грузить.

### Авторизация и доступ

Пока не понял, как это должно выглядеть. Либо как отдельный продукт, либо интегрировать здесь же. Пока оставляю этот вопрос открытым - всё равно в первую очередь это инструмент для себя.
