import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacialCheckinComponent } from './components/facial-checkin/facial-checkin.component';
import { MembershipTypesComponent } from './components/membership-types/membership-types.component';
import { ClientMembershipHistoryComponent } from './components/client-membership-history/client-membership-history.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthGuard } from '@shared';
import { AdminGuard } from '@shared';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'checkin', component: FacialCheckinComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'membership-types', component: MembershipTypesComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'admin/users', component: UsersAdminComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'clients', component: ClientsComponent },
      { path: 'client-membership-history/:id', component: ClientMembershipHistoryComponent },
      { path: 'audit-logs', component: AuditLogComponent, canActivate: [AuthGuard, AdminGuard] },
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
