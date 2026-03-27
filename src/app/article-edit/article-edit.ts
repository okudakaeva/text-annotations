import { Component, ElementRef, forwardRef, inject, input, OnChanges, SimpleChanges, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import {
  ContentEditableDirective,
  SelectionTracker
} from '../../directives';
import { Button, Toolbar, PreloaderService, AnnotationButtonService, AnnotationButton } from '../../components';
import { AnnotationsRenderer, ArticleService, IAnnotationList, IArticle } from '../../services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-article',
  imports: [
    RouterLink, ReactiveFormsModule,
    ContentEditableDirective,
    Button, Toolbar,
    SelectionTracker, AnnotationButton
  ],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArticleEdit),
      multi: true,
    },
  ],
})
export class ArticleEdit implements OnChanges {
  article = input<IArticle>();
  annotations = input.required<IAnnotationList>();
  private readonly preloader = inject(PreloaderService);
  private readonly articleService = inject(ArticleService);
  private readonly annotationButtonService = inject(AnnotationButtonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  articleTextEl = viewChild<ElementRef>('articleText');
  articleForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    text: new FormControl('', [this.textRequiredValidator.bind(this)]),
  });

  ngOnChanges (changes: SimpleChanges): void {
    if (changes['article'] && this.article()) {
      this.annotationsRenderer.initData(this.annotations());

      queueMicrotask(() => {
        this.articleForm.patchValue({
          title: this.article()!.title || '',
          text: this.article()!.text || '',
        });
      });
    }
  }

  isTextEmpty (): boolean {
    const text = this.articleTextEl()?.nativeElement?.textContent.trim() ?? '';
    return text.length === 0;
  }

  isCreationMode () {
    return this.article()?.id === undefined || this.article()?.id === null;
  }

  textRequiredValidator (): ValidationErrors | null {
    return this.isTextEmpty() ? { required: true }:null;
  }

  saveArticle () {
    if (this.articleForm.valid) {
      const data = {
        ...this.article() || {},
        title: this.articleForm.get('title')?.value || '',
        text: this.articleForm.get('text')?.value || '',
      };
      this.preloader.show();
      this.articleService.createOrUpdate(data).pipe(
        finalize(() => this.preloader.hide()),
      ).subscribe((data) => {
        this.router.navigate(['/article', data.id], { relativeTo: this.route });
      });
    }
  }

  deleteArticle (): void {
    if (!this.isCreationMode() && confirm('Подтверждаете удаление статьи?')) {
      this.preloader.show();
      this.articleService.deleteArticle(this.article()!.id).pipe(
        finalize(() => this.preloader.hide()),
      ).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  onSelectionDetected (range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }
}
