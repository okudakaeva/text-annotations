export const sanitizerConfig = {
  ALLOWED_ATTR: ['data-annotation-id'],
  ALLOWED_TAGS: ['mark', 'p', 'div', 'span', 'strong', 'em', 'br'],
  FORBID_TAGS: ['span'],
  FORBID_ATTR: ['data-has-tooltip', 'data-no-tooltip', 'data-annotation-text'],
};
