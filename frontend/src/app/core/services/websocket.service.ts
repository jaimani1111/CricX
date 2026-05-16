import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private rxStomp: RxStomp;
  private destroy$ = new Subject<void>();

  constructor() {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: environment.wsUrl.replace('http', 'ws') + '/websocket',
      connectHeaders: {},
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 5000,
      debug: (msg: string) => {
        // console.log('WS:', msg);
      }
    });
  }

  connect(): void {
    if (!this.rxStomp.active) {
      this.rxStomp.activate();
    }
  }

  disconnect(): void {
    if (this.rxStomp.active) {
      this.rxStomp.deactivate();
    }
  }

  watchMatch(matchId: string): Observable<any> {
    this.connect();
    return this.rxStomp.watch(`/topic/match/${matchId}`).pipe(
      map(msg => JSON.parse(msg.body)),
      takeUntil(this.destroy$)
    );
  }

  watchChallenges(): Observable<any> {
    this.connect();
    return this.rxStomp.watch('/topic/challenges').pipe(
      map(msg => JSON.parse(msg.body)),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
