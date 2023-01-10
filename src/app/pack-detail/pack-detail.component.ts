import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-pack-detail',
  templateUrl: './pack-detail.component.html',
  styleUrls: ['./pack-detail.component.scss']
})
export class PackDetailComponent implements OnInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit(){
    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-pack-detail", scripts).then(function () {

    })
  }

}
