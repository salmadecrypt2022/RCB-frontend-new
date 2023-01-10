import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit(){
    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-profile", scripts).then(function () {

    })
  }


}
