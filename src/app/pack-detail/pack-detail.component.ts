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
  selector: 'app-pack-detail',
  templateUrl: './pack-detail.component.html',
  styleUrls: ['./pack-detail.component.scss']
})
export class PackDetailComponent implements OnInit {
  showObj: any = {
    category_id: 0,
    price: 0,
    perAddress: 0,
    categoryTokencap: 0,
    category_name:'',
    status:''
  };

  buyForm: any;
  submitted1: Boolean = false;

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

    this._script.loadScripts("app-pack-detail", scripts).then(function () {

    })

    this.showObj.wallet_address = await this.apiService.export();
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {

      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      } else {
        this.toaster.warning('Please Signin / Signup first.', 'Attention!')
        // this.router.navigate([''])
      }
      this.getActiveCategory();

    } else {
      this.toaster.warning('Please Connect wallet first.', 'Attention!')
      // this.router.navigate([''])
    }
  }

  getActiveCategory() {

    this.apiService.getActiveCategory().subscribe((res: any) => {

      if (res && res['data']) {
        let categoryData = res['data'];
        categoryData = categoryData['data'];
        console.log('------------------------categoryData', categoryData);


        this.showObj = {
          category_id: categoryData.category_id ? categoryData.category_id : 0,
          price: categoryData.sPrice ? categoryData.sPrice : 0,
          perAddress: categoryData.maxPerAddress ? categoryData.maxPerAddress : 0,
          categoryTokencap: categoryData.categoryTokencap ? categoryData.categoryTokencap : 0,
          wallet_address:this.showObj.wallet_address,
          category_name:categoryData.category_name ? categoryData.category_name : 0,
          status : categoryData.status ? categoryData.status : 0,
        };
      }
    }, (err: any) => {

    });
  }



  buildCreateForm1() {

    this.buyForm = this._formBuilder.group({

      quantity: ['', [Validators.required]],

    });
  }
  // cat , quantity
  async onClickBuy() {
    
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
    } else {
      this.toaster.warning('Please Signin / Signup first.', 'Attention!');
      return;
      // this.router.navigate([''])
    }
    
    const that = this;
    

    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      
      this.spinner.show();
      this.submitted1 = true;
      if (this.buyForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.buyForm.value;
  
        if (res.quantity && parseInt(res.quantity) > 0) {
          var NFTinstance = await this.apiService.exportInstance(environment.address, environment.ABI);
  
          if (NFTinstance && NFTinstance != undefined) {
  
            const that = this;
            //this.toaster.error("You'!", 'Error!');
            
            let balance=await NFTinstance.methods.balanceOf(that.showObj.wallet_address).call();
            if(parseInt(res.quantity)+parseInt(balance)>parseInt(this.showObj.perAddress)){
              console.log("balance is----->",balance);
              this.toaster.error("Ammount Exceed Maxm per wallet address!", 'Error!');
              this.spinner.hide();
            
              return;
              
              
            }
            this.spinner.show();
       
            let amt = parseInt(res.quantity) * parseFloat(that.showObj.price);
            await NFTinstance.methods.mintTokens(that.showObj.category_id, parseInt(res.quantity))
              .send({
                from: that.showObj.wallet_address,
                value: await window.web3.utils.toWei(`${amt}`),
              })
              .on('transactionHash', async (hash: any) => {
                this.spinner.hide();
                console.log(hash);
                let oDataToPass = {
                  quantity: res.quantity,
                  category_id: that.showObj.category_id,
                  sTransactionStatus: 0,
                  sWalletAddress: that.showObj.wallet_address,
                  sPrice: amt,
                  sTransactionHash: hash
                };
                console.log(oDataToPass);
                this.spinner.show();
                await this.apiService.createTransaction(oDataToPass).subscribe(async (transData: any) => {
                  this.spinner.hide();
                  if (transData && transData['data']) {
                    that.toaster.success('Transaction mined successfully. it will be Reflected Once Transaction is mined.', 'Success!');
                    // that.router.navigate(['/marketplace']);
                    // await this.router.navigate(['']);
                    that.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                })
              }).catch(function (error: any) {
                that.spinner.hide();
                that.onClickRefresh();
                console.log(error);
                if (error.code == 32603) {
                  that.toaster.error("You're connected to wrong network!", 'Error!');
                }
                if (error.code == 4001) {
                  that.toaster.error("You Denied Transaction Signature", 'Error!');
                }
              });
  
  
          }
        } else {
          this.toaster.error('Quantity greator then 0.');
        }
  
        this.spinner.hide();
      }

    } else {
      this.toaster.error('Please Signin / Signup first.', 'Error!')
      // this.router.navigate([''])
    }



  }
    
  onClickRefresh() {
    window.location.reload();
  }

}
