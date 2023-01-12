import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

declare let window: any;
@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.scss']
})
export class PacksComponent implements OnInit {
  showObj: any = {
    category_id: 0,
    price: 0,
    perAddress: 0,
    categoryTokencap:0,
    category_name:'',
  };
  priceInUSD:any =0;
 balance :any= 0;
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
    
   await this.getPrice();
    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-packs", scripts).then(function () {

    })
    this.getActiveCategory();
    this.showObj.wallet_address = await this.apiService.export();
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {

      let bal = await window.web3.eth.getBalance( this.showObj.wallet_address);
      this.balance =(bal/1e18 ) * this.priceInUSD;
      console.log('------------------bal',bal);

      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      } else {
        //this.toaster.warning('Please Signin / Signup first.', 'Attention!')
        // this.router.navigate([''])
      }
     

    } else {
      //this.toaster.warning('Please Connect wallet first.', 'Attention!')
      // this.router.navigate([''])
    }
  }

  getPrice(){
    
    this.apiService.getPrice().subscribe(async (data: any) => {

      if (data['matic-network']) {
        let res = await data['matic-network'].usd;
        this.priceInUSD =res;
        console.log('--------------------res',res);
        // priceInUSD
      } else {
        this.priceInUSD =0;
      }
    }, (error) => {
      if (error) {

      }
    })

  }

  getActiveCategory() {

    this.apiService.getActiveCategory().subscribe((res: any) => {

      if (res && res['data']) {
        let categoryData = res['data'];
        categoryData = categoryData['data'];
        console.log('------------------------categoryData', categoryData);


        this.showObj = {
          category_id: categoryData.category_id ? categoryData.category_id : 0,
          price: categoryData.sPrice ? categoryData.sPrice* this.priceInUSD : 0,
          perAddress: categoryData.maxPerAddress ? categoryData.maxPerAddress : 0,
          categoryTokencap:categoryData.categoryTokencap ? categoryData.categoryTokencap : 0,
          category_name:categoryData.category_name ? categoryData.category_name : 0
        }
      }
    }, (err: any) => {

    });
  }


  detailPage() {
    this.router.navigate(['/pack-detail'])
  }

}
