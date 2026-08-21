import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacialCheckinComponent } from './components/facial-checkin/facial-checkin.component';
import { MembershipTypesComponent } from './components/membership-types/membership-types.component';
import { ClientMembershipHistoryComponent } from './components/client-membership-history/client-membership-history.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthGuard, AdminGuard, SuperAdminGuard, SharedLandingComponent } from '@shared';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { RoutinesComponent } from './components/routines/routines.component';
import { AdminMeasurementsComponent } from './components/measurements/admin-measurements.component';
import { TenantsComponent } from './components/tenants/tenants.component';
import { PlatformLayoutComponent } from './components/platform-layout/platform-layout.component';
import { PlatformDashboardComponent } from './components/platform-dashboard/platform-dashboard.component';

const routes: Routes = [
  { path: '', component: SharedLandingComponent, data: { appType: 'admin' } },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'checkin', component: FacialCheckinComponent },
      { path: 'membership-types', component: MembershipTypesComponent, canActivate: [AdminGuard] },
      { path: 'admin/users', component: UsersAdminComponent, canActivate: [AdminGuard] },
      { path: 'clients', component: ClientsComponent },
      { path: 'exercises', component: ExercisesComponent },
      { path: 'routines', component: RoutinesComponent },
      { path: 'measurements', component: AdminMeasurementsComponent },
      { path: 'client-membership-history/:id', component: ClientMembershipHistoryComponent },
      { path: 'audit-logs', component: AuditLogComponent, canActivate: [AdminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'platform',
    component: PlatformLayoutComponent,
    canActivate: [SuperAdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PlatformDashboardComponent },
      { path: 'tenants', component: TenantsComponent },
      { path: 'tenants/:id', component: TenantsComponent }
    ]
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
