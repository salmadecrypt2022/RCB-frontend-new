import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    file:any;

    editProfileform: any;
    submitted1: Boolean = false;


  onSelectDocument(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {
        this.file = event.target.files[0];
      }
    }
  }
  
  onClickSubmit() {
    // this.spinner.show();
    // this.submitted1 = true;
    // if (this.editProfileform.invalid) {
    //   this.spinner.hide();
    //   return;
    // } else {

    //   let res = this.editProfileform.value;
    //   var fd = new FormData();

    //   fd.append('sFirstname', res.sFirstname);
    //   fd.append('sLastname', res.sLastname);
    //   fd.append('sUserName', res.sUserName);
    //   fd.append('sWalletAddress', res.sWalletAddress);
    //   fd.append('sBio', res.sBio);
    //   fd.append('sWebsite', res.sWebsite && res.sWebsite != undefined ? res.sWebsite : '');
    //   fd.append('sEmail', res.sEmail);

    //   if (this.file && this.file != undefined) {
    //     fd.append('userProfile', this.file);

    //   }
    //   this.apiService.updateProfile(fd).subscribe((updateData: any) => {
    //     this.spinner.hide();
    //     if (updateData && updateData['data']) {
    //       this.toaster.success('Profile updted successfully.','Success!')
    //       this.onClickRefresh();
    //     } else {

    //     }

    //   }, (err: any) => {
    //     this.spinner.hide();
    //     if (err && err['error']) {
    //       err = err['error'];

    //       if (err && err['message']) {
    //         this.toaster.error(err['message'],'Error!')

    //       }
    //     }
    //   });
    // }


  }
}
