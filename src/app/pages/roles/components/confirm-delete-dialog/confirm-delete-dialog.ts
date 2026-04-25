import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RolesStore } from '../../roles.store';

export interface ConfirmDeleteDialogData {
  roleId: string;
  roleName: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-delete-dialog.html',
  styleUrl: './confirm-delete-dialog.css',
})
export class ConfirmDeleteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent, boolean>);
  private readonly rolesStore = inject(RolesStore);
  readonly data = inject<ConfirmDeleteDialogData>(MAT_DIALOG_DATA);

  cancel(): void { this.dialogRef.close(false); }

  confirm(): void {
    try {
      this.rolesStore.deleteRole(this.data.roleId);
      this.dialogRef.close(true);
    } catch (error) {
      // In a real app, we might show an error message
      console.error('Failed to delete role:', error);
      this.dialogRef.close(false);
    }
  }
}