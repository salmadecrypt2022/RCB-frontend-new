import { AfterViewInit, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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

  date: any;
  now: any;
  targetDate: any = new Date(2023, 3, 31, 10, 0, 0);
  targetTime: any = this.targetDate.getTime();

  difference: number;
  months: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  currentTime: any = `${this.months[this.targetDate.getMonth()]
    } ${this.targetDate.getDate()}, ${this.targetDate.getFullYear()}`;

  @ViewChild('days', { static: true }) days: ElementRef;
  @ViewChild('hours', { static: true }) hours: ElementRef;
  @ViewChild('minutes', { static: true }) minutes: ElementRef;
  @ViewChild('seconds', { static: true }) seconds: ElementRef;

  ngAfterViewInit() {
    setInterval(() => {
      this.tickTock();
      this.difference = this.targetTime - this.now;
      this.difference = this.difference / (1000 * 60 * 60 * 24);
    }, 1000);
  }

  tickTock() {
    this.date = new Date();
    this.now = this.date.getTime();
    this.days.nativeElement.innerText = Math.floor(this.difference);
    this.hours.nativeElement.innerText = 23 - this.date.getHours();
    this.minutes.nativeElement.innerText = 60 - this.date.getMinutes();
    this.seconds.nativeElement.innerText = 60 - this.date.getSeconds();
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
