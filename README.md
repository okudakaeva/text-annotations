# Text Annotations

Веб-приложение для создания, редактирования и интерактивного аннотирования текстовых документов с цветовой маркировкой выделенных фрагментов и всплывающими подсказками.

https://okudakaeva.github.io/text-annotations/

![Performance](https://raw.githubusercontent.com/okudakaeva/text-annotations/refs/heads/badges/images/lighthouse_performance.svg) ![Accessibility](https://raw.githubusercontent.com/okudakaeva/text-annotations/refs/heads/badges/images/lighthouse_accessibility.svg) ![Best Practices](https://raw.githubusercontent.com/okudakaeva/text-annotations/refs/heads/badges/images/lighthouse_best-practices.svg) ![SEO](https://raw.githubusercontent.com/okudakaeva/text-annotations/refs/heads/badges/images/lighthouse_seo.svg)

---

## Ключевая функциональность

* **Редактор и просмотр документов:** Создание, редактирование и удаление статей с реактивной валидацией форм и сохранением структуры форматирования.
* **Интерактивное аннотирование через Selection API:** Выделение произвольных фрагментов текста (включая многострочные и вложенные DOM-узлы) с автоматическим позиционированием контекстной кнопки создания заметки в пределах viewport.
* **Цветовая маркировка и тултипы:** Назначение индивидуального цвета подсветки (`<mark data-annotation-id>`) и отображение всплывающих подсказок с автопереворотом при нехватке места у границ экрана.
* **XSS-защита и санитизация:** Многоуровневая очистка пользовательского HTML через **DOMPurify** с белым списком разрешённых тегов и атрибутов, а также безопасное применение стилей через CSSOM.
* **Клиентское хранилище:** Персистентное хранение статей и связанных аннотаций с реактивным обновлением интерфейса.

---

## Архитектура и технологический стек

* **Фреймворк:** Angular 21 (`@angular/core` 21.2, Standalone Components, `ChangeDetectionStrategy.OnPush`).
* **Реактивность:** Angular Signals (`signal`, `computed`, `effect`, `input`, `output`), `withComponentInputBinding()`, RxJS (`firstValueFrom`, `takeUntilDestroyed`).
* **Работа с DOM и формами:**
  * `ReactiveContentEditable` — кастомный `ControlValueAccessor` для `contenteditable`-области с фильтрацией вставки (`plain text`), защитой от дублирования событий и санитизацией.
  * `SelectionTracker` — отслеживание текстовых выделений (мышь, тач, клавиатура, скролл) с очисткой слушателей через `AbortController`.
  * `AnnotationsRenderer` — глобальный сервис синхронизации стилей аннотаций через `MutationObserver` и микротаски.
  * Динамические оверлеи (`DialogService`, `TooltipService`) на базе `createComponent` с `inputBinding` / `outputBinding` и нативной анимацией выхода `animate.leave`.
* **Типизация и тестирование:** TypeScript 5.9 (`strict: true`, `strictTemplates: true`), юнит-тесты на **Vitest** и **jsdom**.
* **CI/CD:** Автоматический прогон тестов и сборка production-бандла в **GitHub Actions** с деплоем на **GitHub Pages**.

---

## Локальный запуск и команды

```bash
# Установка зависимостей
npm ci

# Запуск dev-сервера (http://localhost:4200)
npm start

# Запуск юнит-тестов (Vitest)
npx ng test --watch=false

# Production-сборка
npm run build
```

---

© Кудакаева Оксана Александровна
