import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit, signal,
  ViewChild
} from '@angular/core';
import { Button } from '../button/button';
import { Subscription } from 'rxjs';
import {
  AnnotationButtonPosition,
  AnnotationButtonService,
  annotationButtonStartPosition
} from './annotation-button.service';
import { DialogService } from '../dialog/dialog.service';
import { AnnotationDialog } from '../annotation-dialog/annotation-dialog';
import { ActivatedRoute } from '@angular/router';
import { AnnotationsService, IAnnotation } from '../../services';

@Component({
  selector: 'app-annotation-button',
  imports: [Button],
  template: `
    <app-button
      #buttonElement
      type="button"
      hint="Создать аннотацию"
      (click)="openAnnotationDialog()"
      title="💬"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
      [style.visibility]="position().visible ? 'visible' : 'hidden' "
      [style.position]="'fixed'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationButton implements OnInit, OnDestroy {
  position = signal<AnnotationButtonPosition>(annotationButtonStartPosition);
  private subscription: Subscription | null = null;
  private readonly positionService = inject(AnnotationButtonService);
  private readonly dialogService = inject(DialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly annotationService = inject(AnnotationsService);
  @ViewChild('buttonElement') buttonElement!: ElementRef<HTMLElement>;

  ngOnInit (): void {
    this.subscription = this.positionService.getPositionUpdates().subscribe(pos => {
      this.position.set(pos);
    });
  }

  openAnnotationDialog (): void {
    const annotationId = this.wrapSelectionWithAnnotation();

    if (!annotationId) {
      return;
    }

    this.dialogService.open(AnnotationDialog, {
      annotation: {
        id: annotationId,
        text: ''
      },
      onSaveAnnotation: (annotation: IAnnotation) => {
        const articleId = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.data['tempId'];
        this.annotationService.createOrUpdate(annotation, articleId);
        this.markAnnotation(annotation);
      },
      onCloseDialog: () => {
        this.removeAnnotationMark(annotationId);
      }
    });
  }

  ngOnDestroy (): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private wrapSelectionWithAnnotation (): string | null {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText) {
      return null;
    }

    const annotationId = Date.now().toString();

    const annotationEl = document.createElement('mark');
    annotationEl.setAttribute('data-annotation-id', annotationId);
    annotationEl.setAttribute('data-no-tooltip', 'true');
    annotationEl.textContent = selectedText;

    range.deleteContents();
    range.insertNode(annotationEl);

    return annotationId;
  }

  private removeAnnotationMark (id: string): void {
    const annotationEl = document.querySelector(`[data-annotation-id="${ id }"]`);

    if (annotationEl) {
      const textNode = document.createTextNode(annotationEl.textContent || '');
      annotationEl.parentNode?.replaceChild(textNode, annotationEl);
    }
  }

  private markAnnotation (annotation: IAnnotation): void {
    const annotationEl = document.querySelector(`[data-annotation-id="${ annotation.id }"]`);

    if (annotationEl) {
      annotationEl.setAttribute('style', ` background: ${annotation.color || ''}` );
      annotationEl.removeAttribute('data-no-tooltip');
      annotationEl.parentNode?.replaceChild(annotationEl, annotationEl); // trigger mutation
    }
  }
}

