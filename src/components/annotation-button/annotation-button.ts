import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button } from '../button/button';
import { AnnotationButtonService } from './annotation-button.service';
import { DialogService } from '../dialog/dialog.service';
import { AnnotationDialog } from '../annotation-dialog/annotation-dialog';
import { AnnotationsService, IAnnotation } from '../../services';

@Component({
  selector: 'app-annotation-button',
  imports: [Button],
  template: `
    <app-button
      type="button"
      hint="Создать аннотацию"
      (clickAction)="openAnnotationDialog()"
      title="💬"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
      [style.visibility]="position().visible ? 'visible' : 'hidden'"
      [style.position]="'fixed'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationButton {
  private readonly positionService = inject(AnnotationButtonService);
  private readonly dialogService = inject(DialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly annotationService = inject(AnnotationsService);

  readonly position = this.positionService.position;

  openAnnotationDialog(): void {
    const annotationId = this.wrapSelectionWithAnnotation();
    if (!annotationId) {
      return;
    }

    this.positionService.hideButton();

    this.dialogService.open(AnnotationDialog, {
      annotation: {
        id: annotationId,
        text: '',
      },
      onSaveAnnotation: async (annotation: IAnnotation) => {
        const articleId =
          this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.data['tempId'];
        await firstValueFrom(this.annotationService.createOrUpdate(annotation, articleId));
        this.markAnnotation(annotation);
      },
      onCloseDialog: () => {
        this.removeAnnotationMark(annotationId);
      },
    });
  }

  private wrapSelectionWithAnnotation(): string | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!selection.toString().trim()) {
      return null;
    }

    const annotationId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Date.now().toString();

    const annotationEl = document.createElement('mark');
    annotationEl.setAttribute('data-annotation-id', annotationId);
    annotationEl.setAttribute('data-no-tooltip', 'true');

    const fragment = range.extractContents();
    annotationEl.appendChild(fragment);
    range.insertNode(annotationEl);

    selection.removeAllRanges();
    return annotationId;
  }

  private removeAnnotationMark(id: string): void {
    const annotationEl = document.querySelector(`[data-annotation-id="${id}"]`);
    if (!annotationEl?.parentNode) return;

    const parent = annotationEl.parentNode;
    while (annotationEl.firstChild) {
      parent.insertBefore(annotationEl.firstChild, annotationEl);
    }
    parent.removeChild(annotationEl);
    parent.normalize();
  }

  private markAnnotation(annotation: IAnnotation): void {
    const annotationEl = document.querySelector<HTMLElement>(
      `[data-annotation-id="${annotation.id}"]`
    );
    if (!annotationEl) return;

    annotationEl.style.backgroundColor = annotation.color || '';
    annotationEl.removeAttribute('data-no-tooltip');
    annotationEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
