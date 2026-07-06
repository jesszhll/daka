/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HabitTask {
  id: string;
  name: string;
  coins: number;
  emoji: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  coins: number;
  emoji: string;
}

export interface DailyLog {
  completedTaskIds: string[];
  totalCount: number; // Stored to prevent historical changes when active tasks change
}

// Maps date string 'YYYY-MM-DD' to completion log
export interface HistoryRecord {
  [dateStr: string]: DailyLog;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'coin';
  emoji?: string;
}

export interface ChikawaCharacter {
  name: string;
  emoji: string;
  avatar: string;
  color: string;
  bg: string;
  quote: string;
}
