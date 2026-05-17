import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'matches', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'auth/partner-signup',
    loadComponent: () => import('./pages/auth/partner-signup/partner-signup.component').then(m => m.PartnerSignupComponent)
  },
  {
    path: 'auth/verify-otp',
    loadComponent: () => import('./pages/auth/otp-verification/otp-verification.component').then(m => m.OtpVerificationComponent)
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/matches/match-feed/match-feed.component').then(m => m.MatchFeedComponent) },
      { path: 'create', loadComponent: () => import('./pages/matches/create-match/create-match.component').then(m => m.CreateMatchComponent) },
      { path: ':id', loadComponent: () => import('./pages/matches/match-detail/match-detail.component').then(m => m.MatchDetailComponent) }
    ]
  },
  {
    path: 'challenges',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/challenges/challenge-feed/challenge-feed.component').then(m => m.ChallengeFeedComponent) },
      { path: 'create', loadComponent: () => import('./pages/challenges/create-challenge/create-challenge.component').then(m => m.CreateChallengeComponent) }
    ]
  },
  {
    path: 'tournaments',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/tournaments/tournament-feed/tournament-feed.component').then(m => m.TournamentFeedComponent) },
      { path: 'create', loadComponent: () => import('./pages/tournaments/create-tournament/create-tournament.component').then(m => m.CreateTournamentComponent) },
      { path: ':id', loadComponent: () => import('./pages/tournaments/tournament-detail/tournament-detail.component').then(m => m.TournamentDetailComponent) }
    ]
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'players',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/players/player-list/player-list.component').then(m => m.PlayerListComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/messages/messages.component').then(m => m.MessagesComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { 
        path: 'super', 
        data: { role: 'SUPER_ADMIN' },
        loadComponent: () => import('./pages/admin/super-admin/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent)
      },
      { 
        path: 'turf', 
        data: { role: 'ADMIN' },
        loadComponent: () => import('./pages/admin/turf-admin/turf-admin-dashboard.component').then(m => m.TurfAdminDashboardComponent)
      }
    ]
  },
  {
    path: 'dev/setup',
    loadComponent: () => import('./pages/dev/setup-dev.component').then(m => m.SetupDevComponent)
  },
  { path: '**', redirectTo: 'matches' }
];
