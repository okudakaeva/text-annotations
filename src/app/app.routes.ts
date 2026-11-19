import { Routes } from '@angular/router';
import { annotationsResolver } from './article-edit/annotations.resolver';
import { articleTempIdResolver } from './article-edit/article-tempid.resolver';
import { articleEditTitleResolver, articleViewTitleResolver, } from './article-edit/article-title.resolver';
import { articleResolver } from './article-edit/article.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list').then((m) => m.List),
    title: 'Список статей — Text Annotations',
  },
  {
    path: 'article/new',
    loadComponent: () => import('./article-edit/article-edit').then((m) => m.ArticleEdit),
    title: 'Новая статья — Text Annotations',
    resolve: {
      tempId: articleTempIdResolver,
    },
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./article/article').then((m) => m.Article),
    title: articleViewTitleResolver,
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
    title: 'Страница не найдена — Text Annotations',
  },
];
