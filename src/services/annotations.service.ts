import { Injectable, signal } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { CommonStorage } from './common-storage';
import { HttpResponse } from '@angular/common/http';
import { IArticle } from './article.service';

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

      if (key?.indexOf(`${ ANNOTATION_PREFIX }`) === 0) {
        const annotation = JSON.parse(CommonStorage.getItem(key)!);

        if (annotation.articleId === id || key?.indexOf(`${ ANNOTATION_PREFIX }${ id }`) === 0) {
          list.set(annotation.id, annotation);
        }
      }
    }

    return (this.wrappedResponse({ body: list }) as Observable<IAnnotationList>)
      .pipe(
        tap((loadedList) => this._annotations.set(new Map(loadedList)))
      );
  }

  getAnnotation (id: IAnnotation['id']): Observable<IAnnotation | null> {
    const annotation = CommonStorage.getItem(`${ ANNOTATION_PREFIX }${ id }`);
    const response = annotation ? { body: JSON.parse(annotation) } : { body: null };

    return this.wrappedResponse(response);
  }

  createOrUpdate (annotation: IAnnotation, articleId: IArticle['id']): Observable<IAnnotation> {
    CommonStorage.setItem(
      `${ ANNOTATION_PREFIX }${ annotation.id }`,
      JSON.stringify({ ...annotation, articleId })
    );

    return (this.wrappedResponse({ body: annotation }) as Observable<IAnnotation>)
      .pipe(
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

  deleteAnnotation (id: IAnnotation['id']): Observable<null> {
    CommonStorage.removeItem(`${ ANNOTATION_PREFIX }${ id }`);

    return (this.wrappedResponse({ body: null }) as Observable<null>)
      .pipe(
        tap(() => {
          this._annotations.update((current) => {
            const next = new Map(current);
            next.delete(id);
            return next;
          });
        })
      );
  }

  clear (): void {
    this._annotations.set(new Map());
  }

  deleteByArticleId(articleId: IArticle['id']): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < CommonStorage.length; i++) {
      const key = CommonStorage.key(i);
      if (key?.startsWith(ANNOTATION_PREFIX)) {
        const raw = CommonStorage.getItem(key);
        if (!raw) continue;

        const annotation = JSON.parse(raw);
        if (annotation.articleId === articleId || key.startsWith(`${ANNOTATION_PREFIX}${articleId}`)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => CommonStorage.removeItem(key));
  }

  private wrappedResponse<T> (value: { body: T; [key: string]: any }): Observable<T | null | Observable<never>> {
    return of(
      new HttpResponse({
        status: 200,
        ...value,
      })
    ).pipe(
      delay(100),
      map((response: HttpResponse<T>) => {
        if (response.status === 200) {
          return response.body;
        } else {
          throw response;
        }
      })
    );
  }
}
