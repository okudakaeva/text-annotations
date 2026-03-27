import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { Observable } from 'rxjs';

export const articleResolver: ResolveFn<IArticle | Observable<never>> = (
  route: ActivatedRouteSnapshot,
) => {
  const service = inject(ArticleService);
  const id = route.paramMap.get('id')!;

  return service.getArticle(id);
};
