import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {ignoreElements} from 'rxjs/operators';
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
  
  isCategoryActive:any
  
  showObj: any = {
    category_id: 0,
    price: 0,
    perAddress: 0,
    categoryTokencap: 0,
    category_name: '',
    status: '',
    startTime:0
  };

  
  targetDate: any = new Date(2023, 3, 31, 10, 0, 0);
  targetTime: any = this.targetDate.getTime();

  difference: number;

  @ViewChild('days', { static: true }) days: ElementRef;
  @ViewChild('hours', { static: true }) hours: ElementRef;
  @ViewChild('minutes', { static: true }) minutes: ElementRef;
  @ViewChild('seconds', { static: true }) seconds: ElementRef;


  ngAfterViewInit() {
    setInterval(() => {
      this.countdownTimer(this.targetTime);
    }, 1000);
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

    await this.getActiveCategory();

    await this.getOwners();
    
   

  }
  
 async getActiveCategory() {

    console.log("active category is called");
    this.apiService.getActiveCategory().subscribe(async(res: any) => {
      if (res && res['data']) {
        let categoryData = res['data'];
        categoryData = categoryData['data'];
        console.log('------------------------categoryData', categoryData, categoryData.starttime);


        this.showObj = {
          category_id: categoryData.category_id ? categoryData.category_id : 0,
          price: categoryData.sPrice ? categoryData.sPrice : 0,
          perAddress: categoryData.maxPerAddress ? categoryData.maxPerAddress : 0,
          categoryTokencap: categoryData.categoryTokencap ? categoryData.categoryTokencap : 0,
          wallet_address: this.showObj.wallet_address,
          category_name: categoryData.category_name ? categoryData.category_name : 0,
          status: categoryData.status ? categoryData.status : 0,
          startTime: categoryData.starttime ? categoryData.starttime : 0
        };
        
        const ct = new Date();
    
        console.log(" ct is----->",ct.getTime(), this.showObj.startTime);
   
          //this.targetDate = new Date(this.showObj.startTime/1)
          let d = new Date(0);
          d.setUTCSeconds(this.showObj.startTime/1000)
          this.targetDate = d;
          this.targetTime = this.targetDate.getTime();
          console.log("category is active",d, this.targetDate.getTime())
          console.log("end  time is",this.targetTime);
          //await this.countdownTimer(currenTimeStamp,this.targetTime)
          var time_left = this.difference / 1000;
          console.log("time left is------>",time_left);
      }
    }, (err: any) => {

    });
  }
  
  //async countdownTimer(startTime:any,endTime:any) {
  async countdownTimer(endTime:any) {
    var date = new Date();
    var startTime = date.getTime()
    const difference =  endTime-startTime;
    let remaining = "Time's up!";
    console.log("difference is sdfsff----->",difference);
  
    if (difference > 0) {
    
       var dayss=Math.floor(difference / (1000 * 60 * 60 * 24));
       var hourss=Math.floor((difference / (1000 * 60 * 60)) % 24);
       var minutess=Math.floor((difference / 1000 / 60) % 60);
       var secondss= Math.floor((difference / 1000) % 60);
       console.log("housr mintus and seconds are",hourss,minutess,secondss);
        this.days.nativeElement.innerText = dayss;
        this.hours.nativeElement.innerText = hourss.toString().padStart(2, '0');
        this.minutes.nativeElement.innerText = minutess.toString().padStart(2, '0');
        this.seconds.nativeElement.innerText = secondss.toString().padStart(2, '0');
      }else{
        this.isCategoryActive=true;
      }
  }

  async getOwners() {

  }

  async subscribe() {

    if (this.val && this.val != undefined && this.val != null && this.val != '') {
      this.spinner.show();

      this.apiService.subscribe({ sEmail: this.val }).subscribe((transData) => {
        this.spinner.hide();
        console.log('--------transData---------', transData)
        transData = transData['data'];
        if (transData && transData['code'] && transData['code'] == 200) {
          this.toaster.success(transData['message'], 'Success!');
          this.onClickRefresh();

        } else {
          this.toaster.warning(transData['message'], 'Attention!');
        }
      }, (err: any) => {

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
