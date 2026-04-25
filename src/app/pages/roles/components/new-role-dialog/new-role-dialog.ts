import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TitleCasePipe } from '@angular/common';
import { RolesStore, RoleColor } from '../../roles.store';

export interface CreateRoleDraft {
  name: string;
  description: string;
  color: RoleColor;
}

@Component({
  selector: 'app-new-role-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    TitleCasePipe,
  ],
  templateUrl: './new-role-dialog.html',
  styleUrl: './new-role-dialog.css',
})
export class NewRoleDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<NewRoleDialogComponent, CreateRoleDraft>);
  private readonly rolesStore = inject(RolesStore);

  readonly colors: RoleColor[] = ['accent', 'info', 'good', 'warn', 'danger'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    color: ['accent', Validators.required],
  });

  getColorCss(color: RoleColor): string {
    switch (color) {
      case 'accent': return 'var(--sys-color-accent)';
      case 'info': return 'var(--sys-color-info)';
      case 'good': return 'var(--sys-color-good)';
      case 'warn': return 'var(--sys-color-warn)';
      case 'danger': return 'var(--sys-color-danger)';
      default: return 'var(--sys-color-accent)';
    }
  }

  cancel(): void { this.ref.close(); }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const nameControl = this.form.get('name');
    if (!nameControl) return;
    
    const name = nameControl.value.trim();
    if (!this.rolesStore.nameIsAvailable(name)) {
      // Mark name field as invalid if not available
      nameControl.setErrors({ notAvailable: true });
      nameControl.markAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    const draft: CreateRoleDraft = {
      name: v.name.trim(),
      description: v.description?.trim() ?? '',
      color: v.color as RoleColor,
    };
    this.ref.close(draft);
  }
}