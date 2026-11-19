import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ReactiveContentEditable, SelectionTracker } from '../../directives';
import {
  AnnotationButton,
  AnnotationButtonService,
  ArticleDeleteButton,
  Button,
  PreloaderService,
  Toolbar,
  TooltipContainer,
} from '../../components';
import { AnnotationsRenderer, AnnotationsService, ArticleService, IArticle, } from '../../services';

@Component({
  selector: 'app-article-edit',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ReactiveContentEditable,
    Button,
    Toolbar,
    SelectionTracker,
    AnnotationButton,
    TooltipContainer,
    ArticleDeleteButton,
  ],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEdit implements OnDestroy {
  readonly article = input<IArticle>();
  readonly tempId = input<IArticle['id'] | null>(null);
  private isSaved = false;

  private readonly preloader = inject(PreloaderService);
  private readonly articleService = inject(ArticleService);
  private readonly annotationsService = inject(AnnotationsService);
  private readonly annotationButtonService = inject(AnnotationButtonService);
  private readonly router = inject(Router);
  private readonly annotationsRenderer = inject(AnnotationsRenderer);

  readonly articleForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    text: new FormControl('', [() => this.textRequiredValidator()]),
  });

  constructor () {
    effect(() => {
      const currentArticle = this.article();

      if (currentArticle) {
        this.articleForm.patchValue({
          title: currentArticle.title || '',
          text: currentArticle.text || '',
        });
        this.annotationsService.pruneOrphansForArticle(currentArticle.id, currentArticle.text);
      }

      this.annotationsRenderer.initData(this.annotationsService.annotations());
    });
  }

  isTextEmpty (): boolean {
    const html = this.articleForm?.get('text')?.value ?? '';
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    return plainText.length === 0;
  }

  textRequiredValidator (control?: AbstractControl): ValidationErrors | null {
    const html = (control?.value ?? this.articleForm?.get('text')?.value ?? '') as string;
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    return plainText.length === 0 ? { required: true } : null;
  }

  isCreationMode (): boolean {
    return Boolean(this.tempId());
  }

  async saveArticle (): Promise<void> {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    const data: Partial<IArticle> = {
      ...(this.article() ?? {}),
      title: this.articleForm.get('title')?.value ?? '',
      text: this.articleForm.get('text')?.value ?? '',
    };

    this.preloader.show();
    try {
      const saved = await firstValueFrom(
        this.articleService.createOrUpdate(data, this.tempId())
      );
      this.isSaved = true;
      await this.router.navigate(['/article', saved.id]);
    } finally {
      this.preloader.hide();
    }
  }

  onSelectionDetected (range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }

  ngOnDestroy (): void {
    const tempId = this.tempId();
    if (tempId && !this.isSaved) {
      this.annotationsService.deleteByArticleId(tempId);
      this.annotationsService.clear();
    }
  }
}
