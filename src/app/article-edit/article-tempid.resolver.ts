import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AnnotationsService } from '../../services';

export const articleTempIdResolver: ResolveFn<string> = () => {
  inject(AnnotationsService).clear();
  return Math.random().toString(36).substring(2, 9);
};
