import { HttpResponse } from '@angular/common/http';
import { delay, map, Observable, of } from 'rxjs';
import { dict } from '../dictionary';

export interface MockResponseOptions<T> {
  body: T;
  status?: number;
  statusText?: string;
}

export function mockHttpResponse<T> (
  options: MockResponseOptions<T>,
  delayMs = dict['MOCK_HTTP_DELAY']
): Observable<T> {
  return of(
    new HttpResponse<T>({
      status: 200,
      ...options,
    })
  ).pipe(
    delay(delayMs),
    map((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.body as T;
      }
      throw response;
    })
  );
}
