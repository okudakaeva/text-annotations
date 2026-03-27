import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { Observable, of } from 'rxjs';

export const articleTempIdResolver: ResolveFn<Observable<IArticle['id']>> = () => {
  const service = inject(ArticleService);

  return of(service.generateId());
};
