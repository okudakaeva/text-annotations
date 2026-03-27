import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TooltipService, TooltipState } from './tooltip.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tooltip',
  template: `
    <div
      class="tooltip"
      [class.visible]="state().isVisible"
      [style.left.px]="state().position.x"
      [style.top.px]="state().position.y"
    >
      <span class="tooltip-content">
        {{ state().text || '…' }}
      </span>
      <button
        class="close-button"
        (click)="onClose()"
      >×</button>
    </div>
  `,
  styleUrl: './tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip implements OnInit, OnDestroy {
  private tooltipService = inject(TooltipService);
  state = signal<TooltipState>( {
    text: '',
    position: { x: 0, y: 0 },
    isVisible: false,
    showCloseButton: true,
    size: { width: 0, height: 0 },
  });

  private dataSubscription!: Subscription;

  ngOnInit(): void {
    this.dataSubscription = this.tooltipService.getTooltipData().subscribe((state) => {
      this.state.set(state);
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  onClose(): void {
    this.tooltipService.hide();
  }
}
