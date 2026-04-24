import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UsersStore, SortKey, SortDir } from './users.store';
import { Role, ROLES, Status, User, UserId } from './fixtures';
import { UsersTableComponent, SortState } from './components/users-table/users-table';
import { UserDetailDrawerComponent } from './components/user-detail-drawer/user-detail-drawer';
import { InviteUserDialogComponent } from './components/invite-user-dialog/invite-user-dialog';

type RoleFilter = Role | 'all';
type StatusFilter = Status | 'all';

const ROLE_CYCLE: RoleFilter[] = ['all', ...ROLES];
const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'inactive', 'pending'];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconButton,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    UsersTableComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersPageComponent {
  readonly store = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly announcer = inject(LiveAnnouncer);

  readonly roles = ROLES;

  readonly subtitle = computed(() => {
    const total = this.store.users().length;
    const active = this.store.activeCount();
    return `${total} people, ${active} active. Manage roles, status, and access across the workspace.`;
  });

  readonly sortState = computed<SortState>(() => this.store.sort());

  readonly filteredCount = computed(() => this.store.filtered().length);

  readonly rangeLabel = computed(() => {
    const f = this.store.filtered().length;
    const p = this.store.page();
    const per = this.store.perPage;
    if (f === 0) return 'Showing 0 of 0';
    const start = (p - 1) * per + 1;
    const end = Math.min(p * per, f);
    return `Showing ${start}–${end} of ${f}`;
  });

  readonly pageNumbers = computed(() => {
    const total = this.store.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly anyFilterActive = computed(() =>
    this.store.search() !== '' ||
    this.store.roleFilter() !== 'all' ||
    this.store.statusFilter() !== 'all'
  );

  onSearchInput(value: string): void {
    this.store.search.set(value);
  }

  cycleRole(): void {
    const cur = this.store.roleFilter();
    const idx = ROLE_CYCLE.indexOf(cur);
    const next = ROLE_CYCLE[(idx + 1) % ROLE_CYCLE.length];
    this.store.roleFilter.set(next);
    this.announcer.announce(`Role filter: ${this.labelForRole(next)}. ${this.filteredCount()} users.`);
  }

  cycleStatus(): void {
    const cur = this.store.statusFilter();
    const idx = STATUS_CYCLE.indexOf(cur);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    this.store.statusFilter.set(next);
    this.announcer.announce(`Status filter: ${this.labelForStatus(next)}. ${this.filteredCount()} users.`);
  }

  labelForRole(r: RoleFilter): string { return r === 'all' ? 'All' : r; }
  labelForStatus(s: StatusFilter): string { return s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1); }

  onSortChange(next: SortState): void {
    this.store.sort.set({ key: next.key as SortKey, dir: next.dir as SortDir });
  }

  onToggleAll(checked: boolean): void {
    this.store.setSelectionForVisible(checked);
  }

  onToggleRow(id: UserId): void {
    this.store.toggleSelection(id);
  }

  bulkDeactivate(): void {
    const ids = this.store.selection();
    if (ids.size === 0) return;
    this.store.bulkSetStatus(ids, 'inactive');
    this.announcer.announce(`${ids.size} users deactivated.`);
  }

  bulkChangeRole(role: Role): void {
    const ids = this.store.selection();
    if (ids.size === 0) return;
    const count = ids.size;
    this.store.bulkSetRole(ids, role);
    this.announcer.announce(`${count} users set to role ${role}.`);
  }

  openDrawer(id: UserId): void {
    const user = this.store.users().find(u => u.id === id);
    if (!user) return;
    this.dialog.open(UserDetailDrawerComponent, {
      data: { user },
      panelClass: 'ch-side-dialog',
      width: '440px',
      height: '100vh',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      autoFocus: 'first-header',
      restoreFocus: true,
      hasBackdrop: true,
      backdropClass: 'ch-side-backdrop',
    });
  }

  openInvite(): void {
    const ref = this.dialog.open(InviteUserDialogComponent, {
      width: '560px',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
    ref.afterClosed().subscribe(draft => {
      if (!draft) return;
      const user = this.store.invite(draft);
      this.announcer.announce(`Invited ${user.name}.`);
    });
  }

  goToPage(p: number): void {
    const total = this.store.totalPages();
    this.store.page.set(Math.min(Math.max(1, p), total));
  }

  prevPage(): void { this.goToPage(this.store.page() - 1); }
  nextPage(): void { this.goToPage(this.store.page() + 1); }

  clearFilters(): void {
    this.store.clearFilters();
    this.announcer.announce(`Filters cleared. Showing ${this.store.filtered().length} users.`);
  }

  resetDemo(): void {
    this.store.resetToDemo();
    this.announcer.announce('Demo data restored.');
  }

  onToggleStatus(id: UserId): void {
    this.store.toggleStatus(id);
  }

  trackById = (_: number, u: User) => u.id;
}
