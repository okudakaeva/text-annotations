import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnnotationsService } from './annotations.service';
import { CommonStorage } from './common-storage';
import { mockHttpResponse } from './mock-http';
import { dict } from '../dictionary';

export interface IArticle {
  id: string;
  title: string;
  text: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly annotationsService = inject(AnnotationsService);

  getList (): Observable<IArticle[]> {
    const list: IArticle[] = [];
    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);

      if (key?.indexOf(dict['STORAGE_ARTICLE_PREFIX']) === 0) {
        list.push(JSON.parse(CommonStorage.getItem(key)!));
      }
    }

    list.sort((a, b) => b.timestamp - a.timestamp);

    return mockHttpResponse({ body: list });
  }

  getArticle (id: IArticle['id']): Observable<IArticle> {
    const raw = CommonStorage.getItem(`${ dict['STORAGE_ARTICLE_PREFIX'] }${ id }`);

    if (!raw) {
      return mockHttpResponse<IArticle>({
        status: 404,
        statusText: 'Not Found',
        body: null as unknown as IArticle,
      });
    }

    return mockHttpResponse<IArticle>({ body: JSON.parse(raw) });
  }

  createOrUpdate (
    article: Partial<IArticle>,
    tempId: IArticle['id'] | null = null
  ): Observable<IArticle> {
    const savedArticle: IArticle = {
      id: article.id ?? tempId ?? this.generateId(),
      title: article.title ?? '',
      text: article.text ?? '',
      timestamp: article.timestamp ?? Date.now(),
    };

    CommonStorage.setItem(`${ dict['STORAGE_ARTICLE_PREFIX'] }${ savedArticle.id }`, JSON.stringify(savedArticle));

    return mockHttpResponse({ body: savedArticle });
  }

  deleteArticle (id: IArticle['id']): Observable<null> {
    CommonStorage.removeItem(`${ dict['STORAGE_ARTICLE_PREFIX'] }${ id }`);
    this.annotationsService.deleteByArticleId(id);

    return mockHttpResponse({ body: null });
  }

  generateId (): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
