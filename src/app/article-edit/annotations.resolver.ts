import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AnnotationsService, IAnnotationList } from '../../services';

export const annotationsResolver: ResolveFn<IAnnotationList> = (
  route: ActivatedRouteSnapshot,
) => {
  const service = inject(AnnotationsService);
  const id = route.paramMap.get('id')!;

  return service.getListByArticleId(id);
};
