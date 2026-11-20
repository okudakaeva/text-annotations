import { dict } from '../dictionary';

const parseRule = (rule: string): string[] => rule.split(dict['SANITIZER_RULES_DIV']);

export const sanitizerConfig = {
  ALLOWED_TAGS: [
    dict['MARK_TAG'],
    ...parseRule(dict['SANITIZER_ALLOWED_TAGS'])
  ],
  ALLOWED_ATTR: [
    dict['ATTR_ANNOTATION_ID'],
    ...parseRule(dict['SANITIZER_ALLOWED_ATTR'])
  ],
  FORBID_TAGS: [
    ...parseRule(dict['SANITIZER_FORBID_TAGS'])
  ],
  FORBID_ATTR: [
    dict['ATTR_HAS_TOOLTIP'],
    dict['ATTR_NO_TOOLTIP'],
    ...parseRule(dict['SANITIZER_FORBID_ATTR'])
  ],
};
