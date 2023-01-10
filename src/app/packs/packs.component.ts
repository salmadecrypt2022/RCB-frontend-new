import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.scss']
})
export class PacksComponent implements OnInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit(){
    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-packs", scripts).then(function () {

    })
  }


}
