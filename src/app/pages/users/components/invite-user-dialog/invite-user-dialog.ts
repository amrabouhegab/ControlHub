import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DEPARTMENTS, Role, ROLES } from '../../fixtures';
import { InviteDraft } from '../../users.store';

@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './invite-user-dialog.html',
  styleUrl: './invite-user-dialog.css',
})
export class InviteUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<InviteUserDialogComponent, InviteDraft>);

  readonly roles = ROLES;
  readonly departments = DEPARTMENTS;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/.+@.+/)]],
    role: ['Support' as Role, Validators.required],
    dept: ['Customer Success', Validators.required],
    note: [''],
    requireMfa: [true],
  });

  cancel(): void { this.ref.close(); }

  send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const draft: InviteDraft = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      role: v.role,
      dept: v.dept,
      note: v.note,
      requireMfa: v.requireMfa,
    };
    this.ref.close(draft);
  }
}

