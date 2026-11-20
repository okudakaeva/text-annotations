import { Routes } from '@angular/router';
import { annotationsResolver } from './article-edit/annotations.resolver';
import { articleTempIdResolver } from './article-edit/article-tempid.resolver';
import { articleEditTitleResolver, articleReadTitleResolver, } from './article-edit/article-title.resolver';
import { articleResolver } from './article-edit/article.resolver';
import { dict } from '../dictionary';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list').then((m) => m.List),
    title: `${ dict['PAGE_LIST_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`,
  },
  {
    path: 'article/new',
    loadComponent: () => import('./article-edit/article-edit').then((m) => m.ArticleEdit),
    title: `${ dict['PAGE_NEW_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`,
    resolve: {
      tempId: articleTempIdResolver,
    },
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./article/article').then((m) => m.Article),
    title: articleReadTitleResolver,
    resolve: {
      article: articleResolver,
      _annotations: annotationsResolver,
    },
  },
  {
    path: 'article/:id/edit',
    loadComponent: () => import('./article-edit/article-edit').then((m) => m.ArticleEdit),
    title: articleEditTitleResolver,
    resolve: {
      article: articleResolver,
      _annotations: annotationsResolver,
    },
  },
  {
    path: '**',
    loadComponent: () => import('../components/not-found/not-found').then((m) => m.NotFound),
    title: `${ dict['PAGE_NOT_FOUND_TITLE'] }${ dict['TITLE_SEPARATOR'] }${ dict['APP_TITLE'] }`,
  },
];
