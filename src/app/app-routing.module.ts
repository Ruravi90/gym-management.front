import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacialCheckinComponent } from './components/facial-checkin/facial-checkin.component';
import { MembershipComponent } from './components/membership/membership.component';
import { ClientMembershipHistoryComponent } from './components/client-membership-history/client-membership-history.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { ClientsComponent } from './components/clients/clients.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'checkin', component: FacialCheckinComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'memberships', component: MembershipComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'client-membership-history/:id', component: ClientMembershipHistoryComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
