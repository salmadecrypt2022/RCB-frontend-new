import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };
  profileData: any;
login:any= false;

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

    this.showObj.wallet_address = await this.apiService.export();
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {
      
      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
        this.login = true;

        this.apiService.getprofile().subscribe((res: any) => {

          if (res && res['data']) {
            this.profileData = res['data'];
  
          }
  
        }, (err: any) => {

        })
      }else {
        this.login = false;

        this.toaster.warning('Please Signin / Signup first.','Attention!')
        // this.router.navigate([''])
      }
      
  
    }else{
      this.toaster.warning('Please Connect wallet first.','Attention!')
      // this.router.navigate([''])
    }

  }

}
