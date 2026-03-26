import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { Observable } from 'rxjs';

export const articleResolver: ResolveFn<IArticle | Observable<never>> = (
  route: ActivatedRouteSnapshot,
) => {
  const articleService = inject(ArticleService);
  const articleId = route.paramMap.get('id')!;

  return articleService.getArticle(articleId);
};
