import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Article } from './article';

describe('Article', () => {
  let component: Article;
  let fixture: ComponentFixture<Article>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Article],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Article);
    fixture.componentRef.setInput('article', {
      id: 'test-1',
      title: 'Тестовая статья',
      text: '<p>Текст статьи</p>',
      timestamp: Date.now(),
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
