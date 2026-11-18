import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IArticle } from './article.service';
import { CommonStorage } from './common-storage';
import { mockHttpResponse } from './mock-http';

const ANNOTATION_PREFIX = 'annotation_';

export interface IAnnotation {
  id: string;
  text: string;
  color?: string;
}

export type IAnnotationList = Map<IAnnotation['id'], IAnnotation>;

@Injectable({
  providedIn: 'root',
})
export class AnnotationsService {
  private readonly _annotations = signal<IAnnotationList>(new Map());
  readonly annotations = this._annotations.asReadonly();

  getListByArticleId (id: IArticle['id']): Observable<IAnnotationList> {
    const list: IAnnotationList = new Map();
    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);

      if (key?.indexOf(ANNOTATION_PREFIX) === 0) {
        const annotation = JSON.parse(CommonStorage.getItem(key)!);

        if (annotation.articleId === id || key.indexOf(`${ ANNOTATION_PREFIX }${ id }`) === 0) {
          list.set(annotation.id, annotation);
        }
      }
    }

    return mockHttpResponse({ body: list }).pipe(
      tap((loadedList) => this._annotations.set(new Map(loadedList)))
    );
  }

  getAnnotation (id: IAnnotation['id']): Observable<IAnnotation | null> {
    const annotation = CommonStorage.getItem(`${ ANNOTATION_PREFIX }${ id }`);
    return mockHttpResponse<IAnnotation | null>({
      body: annotation ? JSON.parse(annotation) : null,
    });
  }

  createOrUpdate (annotation: IAnnotation, articleId: IArticle['id']): Observable<IAnnotation> {
    CommonStorage.setItem(
      `${ ANNOTATION_PREFIX }${ annotation.id }`,
      JSON.stringify({ ...annotation, articleId })
    );

    return mockHttpResponse({ body: annotation }).pipe(
      tap((saved) => {
        this._annotations.update((current) => {
          const next = new Map(current);
          next.set(saved.id, saved);
          return next;
        });
      })
    );
  }

  hasAnnotation (id: string): boolean {
    return Boolean(CommonStorage.getItem(`${ ANNOTATION_PREFIX }${ id }`));
  }

  hasAnnotation(id: string): boolean {
    return Boolean(CommonStorage.getItem(`${ANNOTATION_PREFIX}${id}`));
  }

  deleteAnnotation (id: IAnnotation['id']): Observable<null> {
    CommonStorage.removeItem(`${ ANNOTATION_PREFIX }${ id }`);

    return mockHttpResponse({ body: null }).pipe(
      tap(() => {
        this._annotations.update((current) => {
          const next = new Map(current);
          next.delete(id);
          return next;
        });
      })
    );
  }

  deleteByArticleId (articleId: IArticle['id']): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);
      if (key?.startsWith(ANNOTATION_PREFIX)) {
        const raw = CommonStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const annotation = JSON.parse(raw);
        if (annotation.articleId === articleId || key.startsWith(`${ ANNOTATION_PREFIX }${ articleId }`)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => CommonStorage.removeItem(key));
  }

  clear (): void {
    this._annotations.set(new Map());
  }
}
