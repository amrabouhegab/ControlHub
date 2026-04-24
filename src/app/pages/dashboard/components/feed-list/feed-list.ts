import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FeedItem } from '../../fixtures';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './feed-list.html',
  styleUrl: './feed-list.css'
})
export class FeedListComponent {
  items = input<FeedItem[]>([]);
  variant = input<'activity' | 'alerts'>('activity');

  isEmpty = () => this.items().length === 0;
}