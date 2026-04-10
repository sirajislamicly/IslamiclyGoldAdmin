import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit {
  @Input('appAnimateOnScroll') animationClass = 'animate-fade-in-up';
  @Input() delay = 0;

  private el = inject(ElementRef);

  ngOnInit(): void {
    const element = this.el.nativeElement as HTMLElement;
    element.style.opacity = '0';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.style.opacity = '1';
            element.classList.add(this.animationClass);
          }, this.delay);
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(element);
  }
}
