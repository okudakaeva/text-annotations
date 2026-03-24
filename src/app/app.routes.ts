import { Routes } from '@angular/router';
import { List } from './list/list';
import { ArticleEdit } from './article-edit/article-edit';
import { articleResolver } from './article-edit/articleResolver';
import { NotFound } from '../components';
import { Article } from './article/article';

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
    }
  },
  {
    path: 'article/:id/edit',
    component: ArticleEdit,
    resolve: {
      article: articleResolver,
    }
  },
  {
    path: '**',
    component: NotFound,
    title: 'Страница не найдена',
  }
];
