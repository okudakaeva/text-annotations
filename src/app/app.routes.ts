import { Routes } from '@angular/router';
import { List } from './list/list';
import { ArticleEdit } from './article-edit/article-edit';
import { articleResolver } from './article-edit/article.resolver';
import { NotFound } from '../components';
import { Article } from './article/article';
import { annotationsResolver } from './article-edit/annotations.resolver';
import { articleTempIdResolver } from './article-edit/article-tempid.resolver';

export const routes: Routes = [
  {
    path: '',
    component: List,
    title: 'Список статей — Text Annotations',
  },
  {
    path: 'article/new',
    component: ArticleEdit,
    title: 'Новая статья — Text Annotations',
    resolve: {
      tempId: articleTempIdResolver,
    },
  },
  {
    path: 'article/:id',
    component: Article,
    title: 'Просмотр статьи — Text Annotations',
    resolve: {
      article: articleResolver,
      _annotations: annotationsResolver,
    },
  },
  {
    path: 'article/:id/edit',
    component: ArticleEdit,
    title: 'Редактирование статьи — Text Annotations',
    resolve: {
      article: articleResolver,
      _annotations: annotationsResolver,
    },
  },
  {
    path: '**',
    component: NotFound,
    title: 'Страница не найдена — Text Annotations',
  },
];
