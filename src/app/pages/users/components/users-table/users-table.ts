import { Component, computed, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User, UserId } from '../../fixtures';
import { SortDir, SortKey } from '../../users.store';
import { StatusChipComponent } from '../status-chip/status-chip';

export interface SortState { key: SortKey; dir: SortDir; }

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatIconButton,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule,
    StatusChipComponent,
  ],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
})
export class UsersTableComponent {
  rows = input.required<User[]>();
  sort = input.required<SortState>();
  selection = input.required<ReadonlySet<UserId>>();
  anyFilterActive = input<boolean>(false);

  sortChange = output<SortState>();
  toggleRowSelection = output<UserId>();
  toggleAllVisible = output<boolean>();
  toggleStatus = output<UserId>();
  openUser = output<UserId>();
  clearFilters = output<void>();

  columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'dept', label: 'Department' },
    { key: 'lastSeen', label: 'Last seen' },
  ];

  allVisibleSelected = computed(() => {
    const rows = this.rows();
    if (rows.length === 0) return false;
    const sel = this.selection();
    return rows.every(r => sel.has(r.id));
  });

  someVisibleSelected = computed(() => {
    const sel = this.selection();
    const rows = this.rows();
    return rows.some(r => sel.has(r.id)) && !this.allVisibleSelected();
  });

  onHeaderClick(key: SortKey): void {
    const current = this.sort();
    const next: SortState = current.key === key
      ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'lastSeen' ? 'asc' : 'asc' };
    this.sortChange.emit(next);
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    const c = this.sort();
    if (c.key !== key) return 'none';
    return c.dir === 'asc' ? 'ascending' : 'descending';
  }

  initials(name: string): string {
    return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
