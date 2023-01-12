import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';


declare let window: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

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


  val: any = '';
  async ngOnInit() {

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
  })

    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-index", scripts).then(function () {

    })


    await this.getOwners();

  }

  async getOwners() {


  }

  async subscribe() {

    if (this.val && this.val != undefined && this.val != null && this.val != '') {
      this.spinner.show();

      this.apiService.subscribe({ sEmail: this.val }).subscribe((transData) => {
        this.spinner.hide();
        console.log('--------transData---------',transData)
        transData = transData['data'];
        if (transData && transData['code'] && transData['code'] == 200) {
            this.toaster.success(transData['message'], 'Success!');
            this.onClickRefresh();
    
        } else {
          this.toaster.warning(transData['message'], 'Attention!');
        }
      },(err:any)=>{

        let transData = err['data'];
        this.toaster.success(transData['message'], 'Attention!');

      });

    } else {
      this.toaster.warning('Please enter valid email.', 'Attention!');
    }
  }

  onClickRefresh() {
    window.location.reload();
  }

}
