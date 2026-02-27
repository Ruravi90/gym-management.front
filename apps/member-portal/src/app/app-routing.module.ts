import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MembershipPurchaseComponent } from './components/membership-purchase/membership-purchase.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'memberships/purchase', component: MembershipPurchaseComponent },
  { path: 'payment/success', component: PaymentResultComponent },
  { path: 'payment/failure', component: PaymentResultComponent },
  { path: 'payment/pending', component: PaymentResultComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
