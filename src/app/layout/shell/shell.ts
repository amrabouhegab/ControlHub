import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class ShellComponent {
  collapsed = signal(false);

  constructor(private route: ActivatedRoute) {}

  get title(): string {
    return (this.route.snapshot.data as { title?: string })?.title || 'Dashboard';
  }

  get crumb(): string {
    return (this.route.snapshot.data as { crumb?: string })?.crumb || 'Home · Overview';
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }
}