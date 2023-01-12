import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {


  file: any;
  profileData: any;
  editProfileform: any;
  submitted1: Boolean = false;
  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };

  constructor(private router: Router,
    private _route: ActivatedRoute,
    private _script: ScriptLoaderService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private apiService: ApiService,
    private _formBuilder: FormBuilder,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  async ngOnInit() {
    this.buildCreateForm1();
    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-profile", scripts).then(function () {

    })

    this.showObj.wallet_address = await this.apiService.export();
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {
      
      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
        this.editProfileform.patchValue({sWalletAddress: this.showObj.wallet_address });


        this.apiService.getprofile().subscribe((res: any) => {

          if (res && res['data']) {
            this.profileData = res['data'];
            this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? '../../assets/images/rcb-footer-logo.png' : 'https://rcb.mypinata.cloud/ipfs/' + this.profileData.sProfilePicUrl;
  
  
            // this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
            // this.profileData.sLastname = this.profileData && this.profileData.oName && this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';
  
            this.editProfileform.patchValue(this.profileData);
          }
  
        }, (err: any) => {

        })
      }else {
        this.toaster.warning('Please Signin / Signup first.','Attention!')
        this.router.navigate([''])
      }
      
  
    }else{
      this.toaster.warning('Please Connect wallet first.','Attention!')
      this.router.navigate([''])
    }
  }


  buildCreateForm1() {

    this.editProfileform = this._formBuilder.group({
      sWalletAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      // sLastname: ['', [Validators.required]],
      // sFirstname: ['', [Validators.required]],
      sUserName: ['', [Validators.required]],
      // userProfile: ['', [Validators.required]],
      sBio: ['', [Validators.required]],
      sWebsite: ['', []],
      sEmail: ['', [Validators.required]],
    });
  }


  onSelectDocument(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {
        this.file = event.target.files[0];
      }
    }
  }

  onClickSubmit() {
    this.spinner.show();
    this.submitted1 = true;
    if (this.editProfileform.invalid) {
      this.spinner.hide();
      return;
    } else {

      let res = this.editProfileform.value;
      var fd = new FormData();


      fd.append('sUserName', res.sUserName);
      fd.append('sWalletAddress', res.sWalletAddress);
      fd.append('sBio', res.sBio);
      fd.append('sWebsite', res.sWebsite && res.sWebsite != undefined ? res.sWebsite : '');
      fd.append('sEmail', res.sEmail);

      if (this.file && this.file != undefined) {
        fd.append('userProfile', this.file);
      }
      this.apiService.updateProfile(fd).subscribe((updateData: any) => {
        this.spinner.hide();
        if (updateData && updateData['data']) {
          this.toaster.success('Profile updted successfully.', 'Success!')
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['error']) {
          err = err['error'];

          if (err && err['message']) {
            this.toaster.error(err['message'], 'Error!')

          }
        }
      });
    }
  }

    
  onClickRefresh() {
    window.location.reload();
  }


}
