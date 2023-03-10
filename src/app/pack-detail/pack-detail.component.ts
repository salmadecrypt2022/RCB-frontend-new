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
    category_name: '',
    status: '',
    startTime:0
  };
  
  isCategoryActive=false;
  
  TotalTokensUserMint:any;

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
    console.log("pack details ngonint is called");
    this.buildCreateForm1();


    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-pack-detail", scripts).then(function () {

    })

    this.getActiveCategory();
   
  

    this.showObj.wallet_address = await this.apiService.export();
    var NFTinstance = await this.apiService.exportInstance(environment.address, environment.ABI);
    this.TotalTokensUserMint=await NFTinstance.methods.maxTokensPerUser().call();
    
    console.log("max tokens per user is---->",this.TotalTokensUserMint)
    
    console.log("wallet address is---->",this.showObj.wallet_address);
    if (this.showObj.wallet_address && this.showObj.wallet_address != '' && this.showObj.wallet_address != []) {

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

  getActiveCategory() {

    console.log("active category is called");
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
          wallet_address: this.showObj.wallet_address,
          category_name: categoryData.category_name ? categoryData.category_name : 0,
          status: categoryData.status ? categoryData.status : 0,
          startTime:categoryData.starttime?categoryData.starttime:0
        };
        console.log(" liveTime is----->",this.showObj.startTime);
        const ct = new Date();
    
        console.log(" ct is----->",ct.getTime());
        if(this.showObj.startTime<ct.getTime()){
          console.log("category is active")
          this.isCategoryActive=true
        }
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
    let networkCheck: any = await this.apiService.checkNetwork();
    //console.log("network check is",networkCheck)
    this.showObj.wallet_address = await this.apiService.export();

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

            console.log("wallet address 1---->", that.showObj.wallet_address);
            //let balance;
            console.log("wallet address is- 2--->",this.showObj.wallet_address);
            
            
            console.log("this show obj is----->",this.showObj);
            
            
            let totalTokenBalance=await NFTinstance.methods.balanceOf(that.showObj.wallet_address).call();
            let maxTokensPerUser=await NFTinstance.methods.maxTokensPerUser().call();
            let tokensLeftTOMint=maxTokensPerUser-totalTokenBalance
            
            console.log("total token balance max tokens per user",totalTokenBalance);
            console.log("res n quantitiy is---->",parseInt(res.quantity))
            
            if(parseInt(totalTokenBalance)+parseInt(res.quantity)>parseInt(maxTokensPerUser)){
              this.toaster.error(`Only ${tokensLeftTOMint} tokens are left for you to mint`, 'Error!');
              this.spinner.hide();
            
              return;
            }
           
            let maxTokenMint=await NFTinstance.methods.totalTokensMintedPerCategory(that.showObj.category_id).call();
            console.log("total token minted is---->",parseInt(maxTokenMint));
            console.log("user token mint---->",parseInt(res.quantity));
            let tokensLeft:any=parseInt(this.showObj.categoryTokencap)-parseInt(maxTokenMint);
            console.log("tokens left are----->",tokensLeft);
            
            if(parseInt(res.quantity)>parseInt(tokensLeft)){
              this.toaster.error(`Only ${tokensLeft} tokens are left in this category`, 'Error!');
              this.spinner.hide();

              return;
            }

            if (parseInt(maxTokenMint) + parseInt(res.quantity) > parseInt(this.showObj.categoryTokencap)) {
              this.toaster.error("All tokens got minted for this category!", 'Error!');
              this.spinner.hide();

              return;
            }
            let balance = await NFTinstance.methods.tokensMintedPerCategoryPerAddress(that.showObj.wallet_address, that.showObj.category_id).call();
            console.log("balance is----->", balance);
            if (parseInt(res.quantity) + parseInt(balance) > parseInt(this.showObj.perAddress)) {
              console.log("balance is----->", balance);
              this.toaster.error("Amount Exceeded Max per wallet address!", 'Error!');
              this.spinner.hide();

              return;


            }
            this.spinner.show();

            let amt = parseInt(res.quantity) * parseFloat(that.showObj.price);
            let mintStatus = await NFTinstance.methods.mintTokens(that.showObj.category_id, parseInt(res.quantity))
              .send({
                from: that.showObj.wallet_address,
                value: await window.web3.utils.toWei(`${amt}`),
              })
              .on('transactionHash', async (hash: any) => {
                // this.spinner.hide();
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

                // console.log("mint status is------>", mintStatus);
                // this.spinner.show();
                await this.apiService.createTransaction(oDataToPass).subscribe(async (transData: any) => {
                  // this.spinner.hide();
                  if (transData && transData['data']) {
                    that.toaster.success('Transaction sent successfully. it will be Reflected Once Transaction is mined.', 'Success!');
                    // that.router.navigate(['/marketplace']);
                    // await this.router.navigate(['']);
                    // that.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                })
              })
              .on('confirmation', (confirmationNumber: any, receipt: any) => {
                this.spinner.show();
                console.log("%c Confirmation #" + confirmationNumber + " Receipt: ", "color: #0000ff");
                console.log(receipt);
                if (receipt?.status === true) {
                  that.toaster.success('Transaction confirmed', 'Success!');
                }
                else if (receipt?.status === false) {
                  that.toaster.error('Transaction failed', 'Error!');
                }
                that.onClickRefresh();
                this.spinner.hide();
              })
              .on('error', (error: any) => {
                console.log("%c Error:: " + error.message, "color: #ff0000");
                return false;
              })

              .catch(function (error: any) {
                that.spinner.hide();
                // that.onClickRefresh();
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
          this.toaster.error('Quantity should be greater than 0.');
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
