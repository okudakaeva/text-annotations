const isIconKey = (key: string): boolean => key.startsWith('ICON_');

function decodeCssIcon(raw: string): string {
  const unquoted = raw.replace(/^['"]|['"]$/g, '');
  return unquoted.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex: string) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
}

interface AppDictionary {
  readonly APP_TITLE: string;
  readonly TITLE_SEPARATOR: string;
  readonly PAGE_LIST_TITLE: string;
  readonly PAGE_NEW_TITLE: string;
  readonly PAGE_NOT_FOUND_TITLE: string;
  readonly PAGE_ARTICLE_READ_TITLE: string;
  readonly PAGE_ARTICLE_EDIT_TITLE: string;
  readonly PAGE_ARTICLE_EDIT_MARK: string;

  readonly ANNOTATION_COLOR: string;
  readonly LINK_COLOR: string;
  readonly HEADER_LINK_COLOR: string;
  readonly DARK_TEXT: string;
  readonly LIGHT_TEXT: string;

  readonly LINK_MARK: string;
  readonly DIALOG_HOST: string;
  readonly ANNOTATION_HOVER_CLASS: string;
  readonly MARK_TAG: string;
  readonly MARK_SELECTOR: string;
  readonly MARK_ANY_SELECTOR: string;
  readonly MARK_BUTTON_SELECTOR: string;
  readonly MARK_NO_TOOLTIP_SELECTOR: string;
  readonly ATTR_ANNOTATION_ID: string;
  readonly ATTR_NO_TOOLTIP: string;
  readonly ATTR_HAS_TOOLTIP: string;

  readonly SANITIZER_RULES_DIV: string;
  readonly SANITIZER_ALLOWED_TAGS: string;
  readonly SANITIZER_ALLOWED_ATTR: string;
  readonly SANITIZER_FORBID_TAGS: string;
  readonly SANITIZER_FORBID_ATTR: string;

  readonly STORAGE_ARTICLE_PREFIX: string;
  readonly STORAGE_ANNOTATION_PREFIX: string;
  readonly MOCK_HTTP_DELAY: number;

  readonly ARTICLE_TITLE_MAX_LENGTH: number;
  readonly ANNOTATION_MAX_LENGTH: number;

  readonly ANNOTATION_BUTTON_SIZE: number;
  readonly VIEWPORT_PADDING: number;
  readonly ANNOTATION_HIGHLIGHT_DELAY: number;
  readonly SIDEBAR_SCROLL_END_DEBOUNCE: number;
  readonly SIDEBAR_SCROLL_DURATION: number;


  readonly ICON_ANNOTATE: string;
  readonly ICON_PENCIL: string;
  readonly ICON_TRASH: string;
  readonly ICON_INFO: string;
  readonly ICON_EDIT: string;
  readonly ICON_DELETE: string;
  readonly ICON_CLOSE: string;
  readonly ICON_TOGGLE: string;

  readonly BTN_SAVE: string;
  readonly BTN_CREATE: string;
  readonly BTN_CANCEL: string;
  readonly BTN_DELETE: string;
  readonly BTN_EDIT: string;
  readonly BTN_CLOSE: string;
  readonly BTN_BACK: string;
  readonly BTN_BACK_TO_INDEX: string;
  readonly BTN_BACK_TO_LIST: string;
  readonly BTN_NEW_ARTICLE: string;

  readonly DIALOG_ANNOTATION_CREATE: string;
  readonly DIALOG_ANNOTATION_EDIT: string;
  readonly DIALOG_ANNOTATION_PLACEHOLDER: string;
  readonly DIALOG_ANNOTATION_COLOR_LABEL: string;
  readonly DIALOG_ARTICLE_DELETE_TITLE: string;
  readonly DIALOG_ARTICLE_DELETE_CONFIRM: string;
  readonly SIDEBAR_TITLE: string;
  readonly SIDEBAR_EMPTY_TEXT: string;
  readonly SIDEBAR_TOGGLE_SHOW: string;
  readonly SIDEBAR_TOGGLE_HIDE: string;
  readonly TOOLTIP_TRIGGER_HINT: string;
  readonly NEW_ANNOTATION_HINT: string;
  readonly DELETE_ANNOTATION_HINT: string;
  readonly EDIT_ANNOTATION_HINT: string;
  readonly EDIT_ARTICLE_TITLE_PLACEHOLDER: string;
  readonly EDIT_ARTICLE_TEXT_PLACEHOLDER: string;
  readonly LIST_EMPTY_TITLE: string;
  readonly LIST_EMPTY_HINT: string;

  readonly [cssVar: string]: string | number | boolean;
}

const cache = new Map<string, unknown>([
  ['APP_TITLE', 'Text Annotations'],
  ['TITLE_SEPARATOR', ' — '],
  ['PAGE_LIST_TITLE', 'Список статей'],
  ['PAGE_NEW_TITLE', 'Новая статья'],
  ['PAGE_NOT_FOUND_TITLE', 'Страница не найдена'],
  ['PAGE_ARTICLE_READ_TITLE', 'Просмотр статьи'],
  ['PAGE_ARTICLE_EDIT_TITLE', 'Редактирование статьи'],
  ['PAGE_ARTICLE_EDIT_MARK', 'Редактирование: '],

  ['LINK_MARK', '#'],
  ['DIALOG_HOST', 'app-dialog-host'],
  ['ANNOTATION_HOVER_CLASS', 'annotation-hover'],
  ['MARK_TAG', 'mark'],
  ['MARK_SELECTOR', 'mark[data-annotation-id]:not([data-no-tooltip])'],
  ['MARK_ANY_SELECTOR', 'mark[data-annotation-id]'],
  ['MARK_BUTTON_SELECTOR', 'span[data-has-tooltip]'],
  ['MARK_NO_TOOLTIP_SELECTOR', 'mark[data-no-tooltip]'],
  ['ATTR_ANNOTATION_ID', 'data-annotation-id'],
  ['ATTR_NO_TOOLTIP', 'data-no-tooltip'],
  ['ATTR_HAS_TOOLTIP', 'data-has-tooltip'],

  ['SANITIZER_RULES_DIV', ', '],
  ['SANITIZER_ALLOWED_TAGS', 'p, strong, em, br, b, u, i, s'],
  ['SANITIZER_ALLOWED_ATTR', ''],
  ['SANITIZER_FORBID_TAGS', 'span'],
  ['SANITIZER_FORBID_ATTR', 'data-annotation-text'],

  ['STORAGE_ARTICLE_PREFIX', 'article_'],
  ['STORAGE_ANNOTATION_PREFIX', 'annotation_'],
  ['MOCK_HTTP_DELAY', 150],

  ['ARTICLE_TITLE_MAX_LENGTH', 120],
  ['ANNOTATION_MAX_LENGTH', 200],

  ['ANNOTATION_BUTTON_SIZE', 36],
  ['VIEWPORT_PADDING', 8],
  ['ANNOTATION_HIGHLIGHT_DELAY', 1200],
  ['SIDEBAR_SCROLL_END_DEBOUNCE', 80],
  ['SIDEBAR_SCROLL_DURATION', 170],

  ['BTN_SAVE', 'Сохранить'],
  ['BTN_CREATE', 'Создать'],
  ['BTN_CANCEL', 'Отмена'],
  ['BTN_DELETE', 'Удалить'],
  ['BTN_EDIT', 'Редактировать'],
  ['BTN_CLOSE', 'Закрыть'],
  ['BTN_BACK', 'Вернуться'],
  ['BTN_BACK_TO_INDEX', 'Вернуться на главную'],
  ['BTN_BACK_TO_LIST', 'К списку статей'],
  ['BTN_NEW_ARTICLE', 'Создать статью'],

  ['DIALOG_ANNOTATION_CREATE', 'Создание аннотации'],
  ['DIALOG_ANNOTATION_EDIT', 'Редактирование аннотации'],
  ['DIALOG_ANNOTATION_PLACEHOLDER', 'Введите текст аннотации...'],
  ['DIALOG_ANNOTATION_COLOR_LABEL', 'Выберите цвет:'],
  ['DIALOG_ARTICLE_DELETE_TITLE', 'Статья будет удалена'],
  ['DIALOG_ARTICLE_DELETE_CONFIRM', 'Вы подтверждаете удаление статьи'],
  ['SIDEBAR_TITLE', 'Аннотации'],
  ['SIDEBAR_EMPTY_TEXT', 'Выделите фрагмент текста, чтобы добавить первую аннотацию.'],
  ['SIDEBAR_TOGGLE_SHOW', 'Показать список аннотаций'],
  ['SIDEBAR_TOGGLE_HIDE', 'Скрыть список аннотаций'],
  ['TOOLTIP_TRIGGER_HINT', 'Аннотация'],
  ['NEW_ANNOTATION_HINT', 'Создать аннотацию'],
  ['DELETE_ANNOTATION_HINT', 'Удалить аннотацию'],
  ['EDIT_ANNOTATION_HINT', 'Редактировать аннотацию'],
  ['EDIT_ARTICLE_TITLE_PLACEHOLDER', 'Придумайте заголовок'],
  ['EDIT_ARTICLE_TEXT_PLACEHOLDER', 'Напишите текст статьи. Для создания аннотации к тексту выделите текст и нажмите кнопку создания аннотации под выделенным текстом'],
  ['LIST_EMPTY_TITLE', 'Статей еще нет'],
  ['LIST_EMPTY_HINT', 'Создайте первую статью'],
]);

export const dict = new Proxy({} as AppDictionary, {
  get (_, prop: string | symbol): unknown {
    if (typeof prop !== 'string') {
      return '';
    }

    if (cache.has(prop)) {
      return cache.get(prop);
    }

    if (typeof document === 'undefined') {
      return '';
    }

    const cssName = `--${ prop.toLowerCase().replace(/_/g, '-') }`;
    const rawValue = getComputedStyle(document.documentElement)
      .getPropertyValue(cssName)
      .trim();

    if (!rawValue) {
      return '';
    }

    const value = isIconKey(prop)
      ? decodeCssIcon(rawValue)
      : rawValue.replace(/^['"]|['"]$/g, '');

    cache.set(prop, value);
    return value;
  },
});
