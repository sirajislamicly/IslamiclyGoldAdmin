import { Directive, ElementRef, Input, OnInit, OnChanges, inject } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnChanges {
  @Input('appCountUp') endVal: number | string = 0;
  @Input() duration = 1200;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() decimals = 0;
  @Input() useIndianFormat = true;

  private el = inject(ElementRef);
  private hasAnimated = false;

  ngOnInit(): void {
    this.startObserver();
  }

  ngOnChanges(): void {
    if (this.hasAnimated) {
      this.animate();
    }
  }

  private startObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animate();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(this.el.nativeElement);
  }

  private animate(): void {
    const end = typeof this.endVal === 'string' ? parseFloat(this.endVal.replace(/[^0-9.-]/g, '')) : this.endVal;
    if (isNaN(end)) {
      this.el.nativeElement.textContent = this.endVal;
      return;
    }

    const start = 0;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = this.easeOutExpo(progress);
      const current = start + (end - start) * eased;

      this.el.nativeElement.textContent = this.prefix + this.formatNumber(current) + this.suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  private formatNumber(n: number): string {
    if (this.useIndianFormat) {
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: this.decimals,
        minimumFractionDigits: this.decimals
      }).format(n);
    }
    return n.toFixed(this.decimals);
  }
}
