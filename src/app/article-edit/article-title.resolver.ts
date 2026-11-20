import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticleService } from '../../services';
import { dict } from '../../dictionary';

export const articleReadTitleResolver: ResolveFn<string> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return `${ dict['PAGE_ARTICLE_READ_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`;
  }

  return inject(ArticleService)
    .getArticle(id)
    .pipe(
      map((article) => `${ article.title }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`),
      catchError(() =>
        of(`${ dict['PAGE_ARTICLE_READ_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`)
      )
    );
};

export const articleEditTitleResolver: ResolveFn<string> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return `${ dict['PAGE_ARTICLE_EDIT_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`;
  }

  return inject(ArticleService)
    .getArticle(id)
    .pipe(
      map((article) =>
        `${ dict['PAGE_ARTICLE_EDIT_MARK'] } ${ article.title }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`
      ),
      catchError(() =>
        of(`${ dict['PAGE_ARTICLE_EDIT_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`)
      )
    );
};
