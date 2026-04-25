import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RoleRecord } from '../../roles.store';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './role-list.html',
  styleUrl: './role-list.css',
})
export class RoleListComponent {
  roles = input.required<RoleRecord[]>();
  activeId = input.required<string>();
  counts = input.required<Record<string, number>>();
  
  select = output<string>();
}