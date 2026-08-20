import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedLandingComponent } from '@shared';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MemberLayoutComponent } from './components/member-layout/member-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MembershipPurchaseComponent } from './components/membership-purchase/membership-purchase.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';
import { QrComponent } from './components/qr/qr.component';
import { ProgressComponent } from './components/progress/progress.component';

const routes: Routes = [
  { path: '', component: SharedLandingComponent, data: { appType: 'member' } },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MemberLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'my-qr', component: QrComponent },
      { path: 'memberships/purchase', component: MembershipPurchaseComponent },
      { path: 'payment/success', component: PaymentResultComponent },
      { path: 'payment/failure', component: PaymentResultComponent },
      { path: 'payment/pending', component: PaymentResultComponent },
      { path: 'mejora-continua', loadChildren: () => import('./components/kaizen/kaizen.module').then(m => m.KaizenModule) },
      { path: 'rutinas', loadChildren: () => import('./components/routines/routines.module').then(m => m.RoutinesModule) },
      { path: 'mi-progreso', component: ProgressComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
