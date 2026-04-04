export interface NotificationEntity {
  id: string;
  userId: string;
  content: string;
  type: string;
  isChecked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationResponse {
  notifications: NotificationEntity[];
  unreadCount: number;
}
