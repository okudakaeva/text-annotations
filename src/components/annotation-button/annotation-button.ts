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

  openAnnotationDialog (): void {
    const annotationId = this.wrapSelectionWithAnnotation();
    if (!annotationId) {
      return;
    }

    this.positionService.hideButton();
    let isSaved = false;

    this.dialogService.open(
      AnnotationDialog, {
        bindings: {
          annotation: {
            id: annotationId,
            text: '',
          },
          onSaveAnnotation: async (annotation: IAnnotation) => {
            const articleId =
              this.route.snapshot.paramMap.get('id') ??
              this.route.snapshot.data['tempId'];
            await firstValueFrom(this.annotationService.createOrUpdate(annotation, articleId));
            isSaved = true;
            this.markAnnotation(annotation);
          },
        },
        onCancel: () => {
          if (!isSaved) {
            this.removeAnnotationMark(annotationId);
          }
        },
      }
    );
  }

  private wrapSelectionWithAnnotation (): string | null {
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

    const textNodes = this.collectTextNodesInRange(range);
    if (textNodes.length === 0) {
      return null;
    }

    for (const { node, start, end } of textNodes) {
      const subRange = document.createRange();
      subRange.setStart(node, start);
      subRange.setEnd(node, end);

      const annotationEl = document.createElement('mark');
      annotationEl.setAttribute('data-annotation-id', annotationId);
      annotationEl.setAttribute('data-no-tooltip', 'true');

      subRange.surroundContents(annotationEl);
    }

    selection.removeAllRanges();
    return annotationId;
  }

  private collectTextNodesInRange (
    range: Range
  ): Array<{ node: Text; start: number; end: number }> {
    const root = range.commonAncestorContainer;

    if (root.nodeType === Node.TEXT_NODE) {
      const textNode = root as Text;
      const slice = textNode.data.slice(range.startOffset, range.endOffset);
      return slice.trim()
        ? [{ node: textNode, start: range.startOffset, end: range.endOffset }]
        : [];
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const result: Array<{ node: Text; start: number; end: number }> = [];
    let current = walker.nextNode() as Text | null;

    while (current) {
      if (range.intersectsNode(current)) {
        const start = current === range.startContainer ? range.startOffset : 0;
        const end =
          current === range.endContainer ? range.endOffset : current.data.length;

        if (end > start && current.data.slice(start, end).trim()) {
          result.push({ node: current, start, end });
        }
      }
      current = walker.nextNode() as Text | null;
    }

    return result;
  }

  private removeAnnotationMark (id: string): void {
    const annotationEls = document.querySelectorAll(`[data-annotation-id="${ id }"]`);
    const parents = new Set<Node>();

    annotationEls.forEach((annotationEl) => {
      const parent = annotationEl.parentNode;
      if (!parent) {
        return;
      }

      parents.add(parent);
      while (annotationEl.firstChild) {
        parent.insertBefore(annotationEl.firstChild, annotationEl);
      }
      parent.removeChild(annotationEl);
    });

    parents.forEach((parent) => parent.normalize());
  }

  private markAnnotation (annotation: IAnnotation): void {
    const annotationEls = document.querySelectorAll<HTMLElement>(
      `[data-annotation-id="${ annotation.id }"]`
    );
    if (annotationEls.length === 0) {
      return;
    }

    annotationEls.forEach((annotationEl) => {
      annotationEl.style.backgroundColor = annotation.color || '';
      annotationEl.removeAttribute('data-no-tooltip');
    });

    annotationEls[0].dispatchEvent(new Event('input', { bubbles: true }));
  }
}
