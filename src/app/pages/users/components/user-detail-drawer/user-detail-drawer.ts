import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuditEntry, SEED_AUDIT, User } from '../../fixtures';
import { StatusChipComponent } from '../status-chip/status-chip';

export interface UserDrawerData {
  user: User;
}

@Component({
  selector: 'app-user-detail-drawer',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    StatusChipComponent,
  ],
  templateUrl: './user-detail-drawer.html',
  styleUrl: './user-detail-drawer.css',
})
export class UserDetailDrawerComponent {
  readonly data = inject<UserDrawerData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<UserDetailDrawerComponent>);

  readonly user = this.data.user;

  readonly activity = computed<AuditEntry[]>(() =>
    SEED_AUDIT.filter(a => a.actor === this.user.name).slice(0, 4)
  );

  initials(): string {
    return this.user.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  close(): void { this.ref.close(); }
}
