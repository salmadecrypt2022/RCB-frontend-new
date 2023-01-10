import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  constructor(private _script: ScriptLoaderService, private apiService: ApiService) { }

  async ngOnInit() {
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


}
