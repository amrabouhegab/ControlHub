import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NAV, NavItem } from './nav.data';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  collapsedChange = output<boolean>();
  currentId = input<string>('dashboard');

  navGroups = signal(NAV);

  getBadge(item: NavItem): number | undefined {
    return item.badge;
  }

  isActive(id: string): boolean {
    return this.currentId() === id;
  }

  toggle(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}