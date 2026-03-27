import { Routes } from '@angular/router';
import { List } from './list/list';
import { ArticleEdit } from './article-edit/article-edit';
import { articleResolver } from './article-edit/article.resolver';
import { NotFound } from '../components';
import { Article } from './article/article';
import { annotationsResolver } from './article-edit/annotations.resolver';

export const routes: Routes = [
  {
    path: '',
    component: List,
    title: 'Список статей',
  },
  {
    path: 'article/new',
    component: ArticleEdit,
  },
  {
    path: 'article/:id',
    component: Article,
    resolve: {
      article: articleResolver,
      annotations: annotationsResolver,
    }
  },
  {
    path: 'article/:id/edit',
    component: ArticleEdit,
    resolve: {
      article: articleResolver,
      annotations: annotationsResolver,
    }
  },
  {
    path: '**',
    component: NotFound,
    title: 'Страница не найдена',
  }
];
