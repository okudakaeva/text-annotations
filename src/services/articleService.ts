import { CommonStorage } from './commonStorage';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

const keyPrefix = 'article_';

export interface IArticle {
  id: string;
  title: string;
  text: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  getList (): Observable<IArticle[]> {
    const list: IArticle[] = [];
    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);

      if (key?.indexOf(keyPrefix) === 0) {
        list.push(JSON.parse(CommonStorage.getItem(key)!));
      }
    }

    list.sort((a, b) => b.timestamp - a.timestamp);

    return this.wrappedResponse({ body: list }) as Observable<IArticle[]>;
  }

  getArticle (id: IArticle['id']): Observable<IArticle | Observable<never>> {
    const article = CommonStorage.getItem(`${ keyPrefix }${ id }`);
    const response = article ? { body: JSON.parse(article) }:{ status: 404, statusText: 'Not Found', body: null };

    return this.wrappedResponse(response);
  }

  createOrUpdate (article: Partial<IArticle>): Observable<IArticle> {
    article.id = article.id ?? this.generateId();
    article.timestamp = article.timestamp ?? Date.now();

    CommonStorage.setItem(`${ keyPrefix }${ article.id }`, JSON.stringify(article));

    return this.wrappedResponse({ body: article }) as Observable<IArticle>;
  }

  deleteArticle (id: IArticle['id']): Observable<null> {
    CommonStorage.removeItem(`${ keyPrefix }${ id }`);

    return this.wrappedResponse({ body: null }) as Observable<null>;
  }

  private wrappedResponse<T> (value: { body: T, [key: string]: any }): Observable<T | null | Observable<never>> {
    return of(new HttpResponse({
      status: 200,
      ...value
    }))
      .pipe(
        delay(100),
        map((response: HttpResponse<T>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            throw response;
          }
        }),
      );
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
