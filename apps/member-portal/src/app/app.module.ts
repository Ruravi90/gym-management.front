import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MembershipPurchaseComponent } from './components/membership-purchase/membership-purchase.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';
import { QrComponent } from './components/qr/qr.component';
import { AuthInterceptor, environment, SharedLandingComponent } from '@shared';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ProgressModule } from './components/progress/progress.module';
import { ProgressComponent } from './components/progress/progress.component';
import { MemberLayoutComponent } from './components/member-layout/member-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    MembershipPurchaseComponent,
    PaymentResultComponent,
    QrComponent,
    ProgressComponent,
    MemberLayoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedLandingComponent,
    ProgressModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
