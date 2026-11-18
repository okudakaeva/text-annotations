import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AnnotationsService } from './annotations.service';
import { ArticleService } from './article.service';
import { CommonStorage } from './common-storage';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let annotationsService: AnnotationsService;

  beforeEach(() => {
    CommonStorage.clear();
    TestBed.configureTestingModule({});
    articleService = TestBed.inject(ArticleService);
    annotationsService = TestBed.inject(AnnotationsService);
  });

  afterEach(() => {
    CommonStorage.clear();
  });

  it('должен возвращать список статей отсортированным от новых к старым', async () => {
    await firstValueFrom(
      articleService.createOrUpdate({ id: 'old', title: 'Старая', text: '<p>1</p>', timestamp: 100 })
    );
    await firstValueFrom(
      articleService.createOrUpdate({ id: 'new', title: 'Новая', text: '<p>2</p>', timestamp: 500 })
    );

    const list = await firstValueFrom(articleService.getList());
    expect(list.map((a) => a.id)).toEqual(['new', 'old']);
  });

  it('должен выбрасывать HttpResponse со статусом 404, если статья не найдена', async () => {
    await expect(firstValueFrom(articleService.getArticle('missing-id'))).rejects.toMatchObject({
      status: 404,
      statusText: 'Not Found',
    } satisfies Partial<HttpResponse<unknown>>);
  });

  it('должен каскадно удалять аннотации статьи при её удалении', async () => {
    const saved = await firstValueFrom(
      articleService.createOrUpdate({ title: 'Статья', text: '<p>Текст</p>' })
    );
    await firstValueFrom(
      annotationsService.createOrUpdate({ id: 'ann-1', text: 'Комментарий' }, saved.id)
    );

    expect(annotationsService.hasAnnotation('ann-1')).toBe(true);

    await firstValueFrom(articleService.deleteArticle(saved.id));

    expect(annotationsService.hasAnnotation('ann-1')).toBe(false);
  });
});
