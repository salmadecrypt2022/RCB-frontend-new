import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ZeroDecimaNumber } from "./numeric.directive";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IndexComponent } from './index/index.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { PacksComponent } from './packs/packs.component';
import { HelpComponent } from './help/help.component';
import { PackDetailComponent } from './pack-detail/pack-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { FooterComponent } from './footer/footer.component';
import { ScriptLoaderService } from './script-loader.service';


@NgModule({
  declarations: [
    ZeroDecimaNumber,
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    IndexComponent,
    MyWalletComponent,
    PacksComponent,
    HelpComponent,
    PackDetailComponent,
    ProfileComponent,
    FooterComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      enableHtml: true,
    }),
  ],
  providers: [ScriptLoaderService],
  bootstrap: [AppComponent]  
})
export class AppModule { }
