import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  read: boolean;
  conversationId: string;
  createdAt: string;
}

export interface InboxEntry {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  conversationId: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly API = environment.apiUrl + '/messages';

  constructor(private http: HttpClient) {}

  sendMessage(receiverId: string, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.API}/send`, { receiverId, content });
  }

  getConversation(otherUserId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API}/conversation/${otherUserId}`);
  }

  getGroupConversation(groupId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API}/group/${groupId}`);
  }

  getInbox(): Observable<InboxEntry[]> {
    return this.http.get<InboxEntry[]>(`${this.API}/inbox`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API}/unread-count`);
  }
}
