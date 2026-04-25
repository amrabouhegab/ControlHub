import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RolesStore, RoleRecord, PermissionSection } from './roles.store';
import { RoleListComponent } from './components/role-list/role-list';
import { PermissionMatrixComponent } from './components/permission-matrix/permission-matrix';
import { NewRoleDialogComponent } from './components/new-role-dialog/new-role-dialog';
import { ConfirmDeleteDialogComponent } from './components/confirm-delete-dialog/confirm-delete-dialog';
import { SEED_PERMISSIONS } from './fixtures';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RoleListComponent,
    PermissionMatrixComponent,
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class RolesPageComponent {
  readonly store = inject(RolesStore);
  private readonly dialog = inject(MatDialog);
  private readonly announcer = inject(LiveAnnouncer);
  
  // SEED_* constants for use in template
  readonly SEED_PERMISSIONS: PermissionSection[] = SEED_PERMISSIONS;
  readonly SECTIONS: PermissionSection[] = SEED_PERMISSIONS;

  readonly subtitle = computed(() => {
    const total = this.store.roles().length;
    const activeRoles = this.store.roles().filter(r => !r.builtIn || r.users > 0).length;
    return `${total} roles, ${activeRoles} manageable. Control what each role can see and do.`;
  });

  readonly selectedRoleName = computed(() => this.store.activeRole().name);
  readonly selectedRoleDescription = computed(() => this.store.activeRole().description);
  readonly hasPersistedOverrides = computed(() => this.store.hasPersistedOverrides());

  onRoleSelect(roleId: string): void {
    this.store.selectRole(roleId);
    const roleName = this.store.roles().find(r => r.id === roleId)?.name;
    this.announcer.announce(`Selected role: ${roleName}`);
  }

  onPermissionToggle(event: { roleId: string; permKey: string }): void {
    this.store.togglePermission(event.roleId, event.permKey);
    this.announcer.announce(`Permission updated`);
  }

  openNewRoleDialog(): void {
    const ref = this.dialog.open(NewRoleDialogComponent, {
      width: '480px',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
    
    ref.afterClosed().subscribe(draft => {
      if (!draft) return;
      const roleId = this.store.createRole(draft);
      const roleName = this.store.roles().find(r => r.id === roleId)?.name;
      this.announcer.announce(`Created role: ${roleName}`);
    });
  }

  openConfirmDeleteDialog(roleId: string): void {
    const roleName = this.store.roles().find(r => r.id === roleId)?.name;
    if (!roleName) return;
    
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '360px',
      data: { roleId, roleName },
    });
    
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.announcer.announce(`Deleted role: ${roleName}`);
      }
    });
  }

  duplicateRole(): void {
    const sourceId = this.store.selectedRoleId();
    const newId = this.store.duplicateRole(sourceId);
    const newRoleName = this.store.roles().find(r => r.id === newId)?.name;
    this.announcer.announce(`Duplicated role: ${newRoleName}`);
  }

  resetToDemo(): void {
    this.store.resetToDemo();
    this.announcer.announce('Demo data restored.');
  }

  saveChanges(): void {
    this.store.commit();
    this.announcer.announce('Changes saved');
  }

  discardChanges(): void {
    this.store.discard();
    this.announcer.announce('Changes discarded');
  }

  isDirty(): boolean {
    return this.store.dirty();
  }
}