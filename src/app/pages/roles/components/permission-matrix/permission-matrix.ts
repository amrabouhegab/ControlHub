import { Component, computed, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RoleRecord } from '../../roles.store';
import { PermissionItem, PermissionSection } from '../../roles.store';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.css',
})
export class PermissionMatrixComponent {
  roles = input.required<RoleRecord[]>();
  sections = input.required<PermissionSection[]>();
  draftMatrix = input.required<Record<string, Set<string>>>();
  
  toggle = output<{ roleId: string; permKey: string }>();
}