import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
import transakSDK from '@transak/transak-sdk';


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
    limit: 5,
    page: 1,
    sWalletAddress: ''
  };
  filterData: any = {}
  listData: any = [];
  recordCount: any = 0;
  priceInUSD: any = 0;
  balance: any = 0;
  isFirstPage: any = 1;
  isLastPage: any = 0;
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
      let bal = await window.web3.eth.getBalance(this.showObj.wallet_address);
      this.balance = (bal / 1e18) * this.priceInUSD;
      console.log('------------------bal', bal);
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

  getPrice() {

    this.apiService.getPrice().subscribe(async (data: any) => {

      if (data['matic-network']) {
        let res = await data['matic-network'].usd;
        this.priceInUSD = res;
        console.log('--------------------res', res);
        // priceInUSD
      } else {
        this.priceInUSD = 0;
      }
    }, (error) => {
      if (error) {

      }
    })

  }



  listTransaction(obj: any) {
    this.apiService.listTransaction(obj).subscribe(async (data: any) => {

      if(this.searchData['page'] == 1){
        this.isFirstPage = 1;
      }else{
        this.isFirstPage = 0;
      }
      

      if (data && data['data']) {
        let res = await data['data'];
        this.filterData = res;
        this.recordCount = res['count'];
        if(this.searchData['page'] == 1){
          this.isFirstPage = 1;
        }else{
          this.isFirstPage = 0;
        }
        console.log("res['count']", res['count'], res['count']%5)
        if(res['count']>=(5*this.searchData['page'])){
          this.isLastPage = 0;
        }else{
          this.isLastPage = 1;
        }
        console.log("Data 2" ,res, res['data'].length)
        if (res['data'] && res['data'] != 0 && res['count'] && res['count'] > 0 ) {
          this.listData = res['data'];
        } else {
          this.filterData = {};
          this.listData = [];
          this.isFirstPage = 1;
          this.isLastPage = 1;
        }
      } else {
        this.filterData = {};
        this.listData = [];
        this.isFirstPage = 1;
        this.isLastPage = 1;
      }
    }, (error) => {
      if (error) {

      }
    })
  }

  onClickTXHASH(hash) {
    window.open('https://mumbai.polygonscan.com/tx/' + hash, '_blank').focus();
  }

  async onClickLoadMorePrev() {
    this.searchData['page'] = this.searchData['page'] - 1;
    await this.listTransaction(this.searchData);
  }
  async onClickLoadMoreNext() {
    this.searchData['page'] = this.searchData['page'] + 1;
    await this.listTransaction(this.searchData);
  }

  onClickAdd() {
    let transak = new transakSDK({
      apiKey: 'aa84ba7a-a889-4ca1-8e10-a70f384bbd81', // Your API Key
      environment: 'STAGING', // STAGING/PRODUCTION
      hostURL: window.location.origin,
      widgetHeight: '550px',
      widgetWidth: '500px',
      // Examples of some of the customization parameters you can pass
      defaultCryptoCurrency: 'MATIC', // Example 'ETH'
      walletAddress: this.showObj.wallet_address, // Your customer's wallet address
      themeColor: '000000', // App theme color
      fiatCurrency: 'USD', // If you want to limit fiat selection eg 'USD'
      email: '', // Your customer's email address
      redirectURL: window.location.origin,
    });

    transak.init();

    // To get all the events
    transak.on(transak.ALL_EVENTS, (data) => {
      console.log(data);
    });
    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      console.log(orderData);
      transak.close();
    });
  }
}
