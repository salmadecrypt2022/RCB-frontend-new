import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';


declare let window: any;
@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.scss']
})
export class MyWalletComponent implements OnInit {

  showObj: any = {
    wallet_address: ''
  };
  searchData: any = {
    length: 6,
    start: 0,
    sWalletAddress: ''
  };
  filterData: any = {}
  listData: any = [];
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

    this._script.loadScripts("app-my-wallet", scripts).then(function () {

    })


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
      this.searchData.sWalletAddress = this.showObj.wallet_address;
      this.listTransaction(this.searchData);

    } else {
      //this.toaster.warning('Please Connect wallet first.', 'Attention!')
      this.router.navigate([''])
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



  listTransaction(obj: any) {
    this.apiService.listTransaction(obj).subscribe(async (data: any) => {

      if (data && data['data']) {
        let res = await data['data'];
        this.filterData = res;

        if (res['data'] && res['data'] != 0 && res['data'].length) {
          this.listData = res['data'];
        } else {
          this.filterData = {};
          this.listData = [];
        }
      } else {
        this.filterData = {};
        this.listData = [];
      }
    }, (error) => {
      if (error) {

      }
    })
  }

  onClickTXHASH(hash) {
    window.open('https://mumbai.polygonscan.com/tx/'+hash, '_blank').focus();
  }

  async onClickLoadMore() {
    this.searchData['length'] = this.searchData['length'] + 6;

    await this.listTransaction(this.searchData);
  }



}
