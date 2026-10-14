import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatingMenuComponent } from './components/floating-menu/floating-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FloatingMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {}