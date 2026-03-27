import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { CommonStorage } from './common-storage';
import { HttpResponse } from '@angular/common/http';
import { IArticle } from './article.service';

const keyPrefix = 'annotation_'

export interface IAnnotation {
  id: string,
  text: string,
  color?: string
}

export type IAnnotationList = Map<IAnnotation['id'], IAnnotation>;

@Injectable({
  providedIn: 'root'
})
export class AnnotationsService {

  getListByArticleId (id: IArticle['id']): Observable<IAnnotationList> {
    const list: IAnnotationList = new Map();
    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);

      if (key?.indexOf(`${keyPrefix}`) === 0) {
        const annotation = JSON.parse(CommonStorage.getItem(key)!);

        if (annotation.articleId === id || key?.indexOf(`${keyPrefix}${id}`) === 0) { // backward compatibility
          list.set(annotation.id, annotation);
        }
      }
    }

    return this.wrappedResponse({ body: list }) as Observable<IAnnotationList>;
  }

  getAnnotation (id: IAnnotation['id']): Observable<IAnnotation | null> {
    const annotation = CommonStorage.getItem(`${ keyPrefix }${ id }`);
    const response = annotation ? { body: JSON.parse(annotation) }:{ body: null };

    return this.wrappedResponse(response);
  }
  createOrUpdate (annotation: IAnnotation, articleId: IArticle['id']): Observable<IAnnotation> {
    CommonStorage.setItem(`${ keyPrefix }${ annotation.id }`, JSON.stringify({...annotation, articleId: articleId }));

    return this.wrappedResponse({ body: annotation }) as Observable<IAnnotation>;
  }

  deleteAnnotation (id: IAnnotation['id']): Observable<null> {
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
}
