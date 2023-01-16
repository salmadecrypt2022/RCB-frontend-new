import { Injectable } from '@angular/core';
import Web3 from 'web3';

import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

declare let window: any;


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  web3: any;

  userAccount: any;
  URL: any = environment.URL;

  private behave = new BehaviorSubject<Object>('');
  setBehaviorView(behave: object) {
    this.behave.next(behave);
  }

  /** Get Behavior for user registraion */
  getBehaviorView(): Observable<object> {
    return this.behave.asObservable();
  }
  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    if (window.ethereum) {

      window.web3 = new Web3(window.ethereum);
      this.web3 = new Web3(window.web3.currentProvider);

      // window.web3 = new Web3(Web3.givenProvider);
      // this.web3 = new Web3(Web3.givenProvider);

      // window.web3 = new Web3(window.Web3.givenProvider);

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("2222")
        if (accounts.length) {
          if (this.userAccount != accounts[0]) {

            if (localStorage.removeItem('Authorization') != null) {

            }
            this.userAccount = accounts[0];
            window.location.reload();
          }

        }
        // window.location.reload();
      });

      window.ethereum.on('chainChanged', function () {
        // if (localStorage.removeItem('Authorization') != null) {

        // }
        // // logout();
        // else
        //   window.location.href = '/';
      });
    }
    // Legacy dapp browsers...
    else if (window.web3) {

      // commented for future use
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

  }

  getNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {

      let obj: any = {};
      console.log(window.ethereum.chainId)
      if (window.ethereum.chainId == "0x1") {
        obj.network_name = environment.main;
      }
      if (window.ethereum.chainId == "0x3") {
        obj.network_name = environment.rops;
      }
      if (window.ethereum.chainId == "0x4") {
        obj.network_name = environment.rinkeby;
      }
      if (window.ethereum.chainId == "0x5") {
        obj.network_name = environment.Goerli;
      }
      if (window.ethereum.chainId == "0x2a") {
        obj.network_name = environment.Kovan;
      }
      if (window.ethereum.chainId == '80001') {
        obj.network_name = environment.polyTestnet;
      }
      if (window.ethereum.chainId == '137') {
        obj.network_name = environment.polyMainnet;
      }
      this.setBehaviorView({ ...this.getBehaviorView(), ...obj });
      return obj.network_name;
    }
  }

  async connect() {
    if (window.ethereum) {
      // commented for future use
      return new Promise((resolve, reject) => {

        let temp = window.ethereum.enable();
        // web3.eth.accounts.create();
        if (temp) {
          resolve(temp)
        } else {
          reject(temp);
        }

      })
    } else {
      this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ', 'Error!')
      return 'error'
    }
  }

  // --dn
  async exportInstance(SCAddress: any, ABI: any) {

    let a = await new window.web3.eth.Contract(ABI, SCAddress);
    if (a) {
      return a;
    } else {
      return {};
    }
  }

  async checkNetwork() {
    if (window.ethereum) {
      return new Promise(async (resolve, reject) => {

        try {
          // check if the chain to connect to is installed
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: Web3.utils.toHex(environment.chainId) }], // chainId must be in hexadecimal numbers
          });
        } catch (error) {
          // This error code indicates that the chain has not been added to MetaMask
          // if it is not, then install it into the user MetaMask
          if (error.code === 4902) {
            try {
              let networkdata: any = [];
              switch (Web3.utils.toHex(environment.chainId)) {
                case "0x13881":
                  networkdata = [
                    {
                      chainId: "0x13881", // 80001
                      chainName: "Matic(Polygon) Mumbai Testnet",
                      nativeCurrency: { name: "tMATIC", symbol: "tMATIC", decimals: 18 },
                      rpcUrls: ["https://polygon-mumbai.g.alchemy.com/v2/Z9Pn3WcHAkLtb7oVQO4EtySOKgEwoG5R"],
                      blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                    },
                  ];
                  break;
                case "0x89":
                  networkdata = [
                    {
                      chainId: "0x89", // 137
                      chainName: "Matic(Polygon) Mumbai Mainnet",
                      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                      rpcUrls: ["https://polygon-rpc.com/"],
                      blockExplorerUrls: ["https://polygonscan.com/"],
                    }
                  ];
                  break;

                case "0x61":
                  networkdata = [
                    {
                      chainId: "0x61", // 137
                      chainName: "BSC Testnet",
                      nativeCurrency: { name: "BSC", symbol: "BSC", decimals: 18 },
                      rpcUrls: ["https://data-seed-prebsc-2-s3.binance.org:8545/"],
                      blockExplorerUrls: ["https://testnet.bscscan.com"],
                    }
                  ];
                default:
                  break;
              }

              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: networkdata
              });
            } catch (addError) {
              console.error(addError);
            }
          } else if (error.code === 4001) {
            this.toaster.error("Please switch to correct network.", 'Error!');

            resolve([]);
            this.onClickRefresh();
          } else {
            console.error(error);
            return;
          }
        }

        /*********** Testtt () */

        let accounts: any = await window.ethereum.request({ method: 'eth_requestAccounts' }).then((data: any) => {
          if (data && data.length) {
            return data;
          }
        }).catch(async (err: any) => {
          if (err && err.code == 4001) {
            this.toaster.error(err['message'], 'Error!');
          }

        });

        if (accounts && accounts.length) {
          window.web3.eth.defaultAccount = accounts[0];
          let obj: any = {};
          obj.wallet_address = accounts[0];
          this.setBehaviorView({ ...this.getBehaviorView(), ...obj });

          resolve(accounts[0])
        } else {
          resolve([]);
        }
      })
    } else {
      console.log
      this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ', 'Error!')
    }
  }

  // --dn
  async export() {

    if (window.ethereum) {
      return new Promise(async (resolve, reject) => {



        /*********** Testtt () */

        let accounts: any = await window.ethereum.request({ method: 'eth_requestAccounts' }).then((data: any) => {
          if (data && data.length) {
            return data;
          }
        }).catch(async (err: any) => {
          if (err && err.code == 4001) {
            this.toaster.error(err['message'], 'Error!');
          }

        });

        if (accounts && accounts.length) {
          window.web3.eth.defaultAccount = accounts[0];
          let obj: any = {};
          obj.wallet_address = accounts[0];
          this.setBehaviorView({ ...this.getBehaviorView(), ...obj });

          resolve(accounts[0])
        } else {
          resolve([]);
        }
      })
    } else {
      console.log
      this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ', 'Error!')
    }
  }

  getBalance(contractInstance: any, userWalletAccount: any) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        this.toaster.error('Metamask/Wallet connection failed.', 'Error!');
        return;
      }
      let result = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });

      if (result) {
        result = await Web3.utils.fromWei(`${result}`);
        resolve(result);
      } else {
        reject('err');
      }

    });

  }

  // 
  getHeaders() {
    let t: any = localStorage.getItem('Authorization');
    return t && t != undefined ? t : '';
  }
  checkuseraddress(address: any) {
    return this.http.post(this.URL + '/auth/checkuseraddress', { sWalletAddress: address });
  }

  login(type: any, from: any, toaster: any) {
    const that = this;
    if (window.ethereum) {

      const timestamp = new Date().getTime();
      const message = `RCB uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address - ${from}`;

      console.log(window.web3.utils.fromUtf8(message));

      window.web3.currentProvider.sendAsync({
        method: 'personal_sign',
        params: [message, from],
        from: from,
      }, function (err: any, signature: any) {
        // console.log('---------------------<<M',result);
        // console.log('---------------------<<err',err)
        if (err && err == null || err == undefined) {
          if (signature['result']) {
            if (type == "signin") {
              that.http.post(that.URL + '/auth/login', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  toaster.success('Sign in successfully.', 'Success!');
                  that.onClickRefresh();
                }
              }, (err) => {
                if (err) {
                  toaster.error('There is some issue with sign in', 'Error!');

                }
              });
            }
            if (type == "signup") {
              that.http.post(that.URL + '/auth/register', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {
                  toaster.success('Sign up successfully.', 'Success!');

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  that.onClickRefresh();

                }
              }, (err) => {
                if (err) {
                  toaster.error('There is some issue with sign up', 'Error!');

                }
              });
            }
          }
        } else {
          toaster.error(err['message'], 'Error!');
        }

        // window.web3.eth.personal.sign(message, from, function (err: any, signature: any) {
        // console.log('--------signature-----', signature);
        // console.log('--------err-----', err)

      })
    }
    // return this.http.post(this.URL + '/auth/checkuseraddress', {sWalletAddress:address});
  }

  updateProfile(data: any) {
    return this.http.put(this.URL + '/user/updateProfile', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  onClickRefresh() {
    window.location.reload();
  }

  getprofile() {
    return this.http.get(this.URL + '/user/profile', { headers: { 'Authorization': this.getHeaders() } });
  }
  getActiveCategory() {
    return this.http.get(this.URL + '/user/getCategory');
  }

  
  
  getNextCategoryDate() {
    return this.http.get(this.URL + '/admin/nextCategoryDate');
  }



  createTransaction(data: any) {
    return this.http.post(this.URL + '/transaction/create', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  
  
  
  


  //  # create order based on the reservation id
  //curl --request POST \
  //     --url https://api.testwyre.com/v3/debitcard/process/partner \
  //     --header 'Accept: application/json' \
  //     --header 'Authorization: Bearer SK-86Z8FYFB-UTA2RDCN-HCZBFT2V-xxx' \
  //     --header 'Content-Type: application/json' \
  //     --data '
  //data={
  //     "debitCard": {
  //          "number": "4111111111111111",
  //          "year": "2023",
  //          "month": "10",
  //          "cvv": "555"
  //     },
  //     "address": {
  //          "street1": "1234 Test Ave",
  //          "city": "Los Angeles",
  //          "state": "CA",
  //          "postalCode": "91423",
  //          "country": "US"
  //     },
  //     "reservationId": "2J97BPRFDQ2Y4CJLE8BV",
  //     "amount": "10",
  //     "sourceCurrency": "USD",
  //     "destCurrency": "MATIC",
  //     "dest": "account:AC_WPYM69C7MJG ",
  //     "referrerAccountId": "AC_WPYM69C7MJG",
  //     "givenName": "Crash",
  //     "familyName": "Bandicoot",
  //     "email": "mosajjid.khan@gmail.com",
  //     "ipAddress": "61.95.235.164",
  //     "phone": "+14158122223"
  //}
  //'
  //# response
  //{
  //  "id": "WO_WVZG4WC6E9",
  //  "createdAt": 1648796904745,
  //  "owner": "account:AC_CBLAE64LCTX",
  //  "status": "RUNNING_CHECKS",
  //  "orderType": "DOMESTIC",
  //  "sourceAmount": 15,
  //  "purchaseAmount": 10,
  //  "sourceCurrency": "USD",
  //  "destCurrency": "USD",
  //  "transferId": null,
  //  "dest": "account:AC_YC3NT6GEZ8U ",
  //  "authCodesRequested": false,
  //  "blockchainNetworkTx": null,
  //  "accountId": "AC_CBLAE64LCTX",
  //  "paymentMethodName": null
  //}


  //https://api.testwyre.com/v3/accounts


  //curl --request POST \
  //--url https://api.testwyre.com/v3/orders/reserve \
  //--header 'Accept: application/json' \
  //--header 'Authorization: Bearer SK-86Z8FYFB-UTA2RDCN-HCZBFT2V-xxx' \
  //--header 'Content-Type: application/json'

  //createTransaction(data: any) {
  //  return this.http.post("https://api.testwyre.com/v3/orders/reserve",{headers: { 'Authorization':"Bearer 9d4cd4ea969b42a0a712c7002ca215589c56ceb24c2cab1a9ff2acbb2678"} });
  //}

  //createTransaction() {
  //    return this.http.post("https://api.testwyre.com/v3/debitcard/process/partner",this.data ,{ headers: { 'Authorization': "Bearer 9d4cd4ea969b42a0a712c7002ca215589c56ceb24c2cab1a9ff2acbb2678" } });
  //  }
  //createTransaction(data: any) {
  //  return this.http.post("https://api.testwyre.com/v3/accounts", {"type":"INDIVIDUAL","country": "US","subaccount": true,"profileFields":[{"fieldId": "individualLegalName","value": "MOSAJJID KHAN"},{"fieldId": "individualEmail","value": "mosajjid.khan@gmail.com"},{"fieldId": "individualResidenceAddress","value": {"street1": "1 Market St","street2": "Suite 402","city": "San Francisco","state": "CA","postalCode": "94105","country": "US"}}]},{ headers: { 'Authorization': "Bearer 9d4cd4ea969b42a0a712c7002ca215589c56ceb24c2cab1a9ff2acbb2678" } });
  //}
  listTransaction(data) {
    return this.http.post(this.URL + '/transaction/listByUser', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  getPrice() {
    return this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd', { headers: { 'Authorization': this.getHeaders() } });
  }

  subscribe(data: any) {
    return this.http.post(this.URL + '/user/subscribe', data, { headers: { 'Authorization': this.getHeaders() } });
  }

}
