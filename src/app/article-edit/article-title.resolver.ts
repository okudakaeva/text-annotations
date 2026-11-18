import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticleService } from '../../services';

export const articleViewTitleResolver: ResolveFn<string> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return 'Просмотр статьи — Text Annotations';
  }

  return inject(ArticleService)
    .getArticle(id)
    .pipe(
      map((article) => `${ article.title } — Text Annotations`),
      catchError(() => of('Просмотр статьи — Text Annotations'))
    );
};

export const articleEditTitleResolver: ResolveFn<string> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return 'Редактирование статьи — Text Annotations';
  }

  return inject(ArticleService)
    .getArticle(id)
    .pipe(
      map((article) => `Редактирование: ${ article.title } — Text Annotations`),
      catchError(() => of('Редактирование статьи — Text Annotations'))
    );
};
