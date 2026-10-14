import { Component, signal, computed, effect, HostListener, inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface FloatingWindow {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string;
  route: string;
  position: { x: number; y: number };
  zIndex: number;
  stats: { label: string; value: string }[];
}

@Component({
  selector: 'app-floating-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './floating-menu.component.html',
  styleUrl: './floating-menu.component.css'
})
export class FloatingMenuComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly windows = signal<FloatingWindow[]>([
    {
      id: 'pokedex',
      title: 'Pokédex',
      subtitle: 'Catch them all!',
      icon: 'pokeball',
      color: '#FF6B35',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      route: '/pokedex',
      position: { x: 50, y: 100 },
      zIndex: 10,
      stats: [
        { label: 'Pokémon', value: '1000+' },
        { label: 'Types', value: '18' },
        { label: 'API', value: 'PokeAPI' }
      ]
    },
    {
      id: 'dragonball',
      title: 'Dragon Ball',
      subtitle: 'Power levels over 9000!',
      icon: 'dragonball',
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      route: '/dragonball',
      position: { x: 350, y: 150 },
      zIndex: 10,
      stats: [
        { label: 'Characters', value: '58' },
        { label: 'Races', value: '12' },
        { label: 'API', value: 'DragonBall API' }
      ]
    },
    {
      id: 'simpsons',
      title: 'The Simpsons',
      subtitle: 'D\'oh! Springfield awaits',
      icon: 'simpsons',
      color: '#FF6B35',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      route: '/simpsons',
      position: { x: 650, y: 80 },
      zIndex: 10,
      stats: [
        { label: 'Characters', value: '1,182' },
        { label: 'Episodes', value: '768+' },
        { label: 'API', value: 'Simpsons API' }
      ]
    }
  ]);

  readonly highestZIndex = computed(() => 
    Math.max(...this.windows().map(w => w.zIndex))
  );

  readonly viewportWidth = signal(1200);
  readonly viewportHeight = signal(800);

  private draggedWindowId: string | null = null;
  private dragOffset = { x: 0, y: 0 };
  private isDragging = false;
  private initialPositions: Map<string, { x: number; y: number }> = new Map();
  private animationFrame: number | null = null;
  private velocities: Map<string, { x: number; y: number }> = new Map();

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportWidth.set(window.innerWidth);
      this.viewportHeight.set(window.innerHeight);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.isBrowser) {
      this.viewportWidth.set(window.innerWidth);
      this.viewportHeight.set(window.innerHeight);
      this.constrainAllWindows();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.draggedWindowId) {
      const newX = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;
      
      this.windows.update(windows => 
        windows.map(w => {
          if (w.id === this.draggedWindowId) {
            return {
              ...w,
              position: this.constrainPosition(newX, newY, w),
              zIndex: this.highestZIndex() + 1
            };
          }
          return w;
        })
      );
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging && this.draggedWindowId) {
      const windowId = this.draggedWindowId;
      this.isDragging = false;
      this.draggedWindowId = null;
      this.startPhysics(windowId);
    }
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isDragging && this.draggedWindowId && event.touches.length > 0) {
      const touch = event.touches[0];
      const newX = touch.clientX - this.dragOffset.x;
      const newY = touch.clientY - this.dragOffset.y;
      
      this.windows.update(windows => 
        windows.map(w => {
          if (w.id === this.draggedWindowId) {
            return {
              ...w,
              position: this.constrainPosition(newX, newY, w),
              zIndex: this.highestZIndex() + 1
            };
          }
          return w;
        })
      );
    }
  }

  @HostListener('document:touchend')
  onTouchEnd(): void {
    if (this.isDragging && this.draggedWindowId) {
      const windowId = this.draggedWindowId;
      this.isDragging = false;
      this.draggedWindowId = null;
      this.startPhysics(windowId);
    }
  }

  onMouseDown(windowId: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.draggedWindowId = windowId;
    
    const window = this.windows().find(w => w.id === windowId);
    if (window) {
      this.dragOffset = {
        x: event.clientX - window.position.x,
        y: event.clientY - window.position.y
      };
      this.initialPositions.set(windowId, { ...window.position });
      this.velocities.set(windowId, { x: 0, y: 0 });
      
      // Bring to front
      this.windows.update(windows => 
        windows.map(w => 
          w.id === windowId 
            ? { ...w, zIndex: this.highestZIndex() + 1 }
            : w
        )
      );
    }
  }

  onTouchStart(windowId: string, event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent;
      this.onMouseDown(windowId, fakeEvent);
    }
  }

  onWindowClick(windowId: string): void {
    if (!this.isDragging) {
      const window = this.windows().find(w => w.id === windowId);
      if (window) {
        this.router.navigate([window.route]);
      }
    }
  }

  onKeyDown(windowId: string, event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onWindowClick(windowId);
    }
  }

  onContainerClick(): void {
    // Click on container background - could be used to close any open menus
  }

  private constrainPosition(x: number, y: number, window: FloatingWindow): { x: number; y: number } {
    const windowWidth = 280;
    const windowHeight = 380;
    const padding = 20;
    
    return {
      x: Math.max(padding, Math.min(x, this.viewportWidth() - windowWidth - padding)),
      y: Math.max(padding, Math.min(y, this.viewportHeight() - windowHeight - padding))
    };
  }

  private constrainAllWindows(): void {
    this.windows.update(windows => 
      windows.map(w => ({
        ...w,
        position: this.constrainPosition(w.position.x, w.position.y, w)
      }))
    );
  }

  private startPhysics(windowId: string): void {
    const velocity = this.velocities.get(windowId) || { x: 0, y: 0 };
    const initialPos = this.initialPositions.get(windowId);
    
    if (!initialPos) return;

    const animate = () => {
      this.windows.update(windows => {
        const window = windows.find(w => w.id === windowId);
        if (!window) return windows;

        // Apply velocity
        let newX = window.position.x + velocity.x;
        let newY = window.position.y + velocity.y;

        // Bounce off edges
        const constrained = this.constrainPosition(newX, newY, window);
        let bouncedX = velocity.x;
        let bouncedY = velocity.y;

        if (constrained.x !== newX) bouncedX *= -0.6;
        if (constrained.y !== newY) bouncedY *= -0.6;

        // Apply friction
        bouncedX *= 0.95;
        bouncedY *= 0.95;

        // Spring back to original position if close
        const distX = initialPos.x - constrained.x;
        const distY = initialPos.y - constrained.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 5 && Math.abs(bouncedX) < 0.5 && Math.abs(bouncedY) < 0.5) {
          this.velocities.delete(windowId);
          this.initialPositions.delete(windowId);
          return windows.map(w => 
            w.id === windowId ? { ...w, position: initialPos } : w
          );
        }

        // Spring force
        bouncedX += distX * 0.02;
        bouncedY += distY * 0.02;

        this.velocities.set(windowId, { x: bouncedX, y: bouncedY });

        return windows.map(w => 
          w.id === windowId 
            ? { ...w, position: constrained } 
            : w
        );
      });

      const velocityAfter = this.velocities.get(windowId);
      if (velocityAfter && (Math.abs(velocityAfter.x) > 0.1 || Math.abs(velocityAfter.y) > 0.1)) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.velocities.delete(windowId);
        this.initialPositions.delete(windowId);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  shuffleWindows(): void {
    const padding = 50;
    const windowWidth = 280;
    const windowHeight = 380;
    
    this.windows.update(windows => 
      windows.map((w, i) => {
        const maxX = this.viewportWidth() - windowWidth - padding;
        const maxY = this.viewportHeight() - windowHeight - padding;
        return {
          ...w,
          position: {
            x: padding + Math.random() * Math.max(0, maxX - padding),
            y: padding + Math.random() * Math.max(0, maxY - padding)
          },
          zIndex: 10 + i
        };
      })
    );
  }

  resetPositions(): void {
    const defaultPositions = [
      { x: 50, y: 100 },
      { x: 350, y: 150 },
      { x: 650, y: 80 }
    ];
    
    this.windows.update(windows => 
      windows.map((w, i) => ({
        ...w,
        position: defaultPositions[i] || { x: 50, y: 100 },
        zIndex: 10 + i
      }))
    );
  }
}