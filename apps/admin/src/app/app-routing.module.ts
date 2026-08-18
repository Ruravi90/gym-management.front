import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacialCheckinComponent } from './components/facial-checkin/facial-checkin.component';
import { MembershipTypesComponent } from './components/membership-types/membership-types.component';
import { ClientMembershipHistoryComponent } from './components/client-membership-history/client-membership-history.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthGuard, AdminGuard, SharedLandingComponent } from '@shared';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { RoutinesComponent } from './components/routines/routines.component';
import { AdminMeasurementsComponent } from './components/measurements/admin-measurements.component';

const routes: Routes = [
  { path: '', component: SharedLandingComponent, data: { appType: 'admin' } },
  { path: 'login', component: LoginComponent },
  { path: 'checkin', component: FacialCheckinComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'membership-types', component: MembershipTypesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/users', component: UsersAdminComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  { path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard] },
  { path: 'routines', component: RoutinesComponent, canActivate: [AuthGuard] },
  { path: 'measurements', component: AdminMeasurementsComponent, canActivate: [AuthGuard] },
  { path: 'client-membership-history/:id', component: ClientMembershipHistoryComponent, canActivate: [AuthGuard] },
  { path: 'audit-logs', component: AuditLogComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
