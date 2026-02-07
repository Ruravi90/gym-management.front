import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeEs);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FacialCheckinComponent } from './components/facial-checkin/facial-checkin.component';
import { MembershipComponent } from './components/membership/membership.component';
import { ClientMembershipHistoryComponent } from './components/client-membership-history/client-membership-history.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { ClientsComponent } from './components/clients/clients.component';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    FacialCheckinComponent,
    MembershipComponent,
    ClientMembershipHistoryComponent,
    MainLayoutComponent,
    ClientsComponent
    ,UsersAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
