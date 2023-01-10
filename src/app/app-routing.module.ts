import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { IndexComponent } from './index/index.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { PackDetailComponent } from './pack-detail/pack-detail.component';
import { PacksComponent } from './packs/packs.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full',
  },
  { path: "index", component: IndexComponent },
  { path: "my-wallet", component: MyWalletComponent },
  { path: "profile", component: ProfileComponent },
  { path: "packs", component: PacksComponent },
  { path: "pack-detail", component: PackDetailComponent },
  { path: "help", component: HelpComponent },
  // { path: "collections/:name", component: CollectionsComponent },
  // { path: "user-detail/:id", component: UserDetailComponent },
  // { path: "my-collections", component: CollectionListComponent },


];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
