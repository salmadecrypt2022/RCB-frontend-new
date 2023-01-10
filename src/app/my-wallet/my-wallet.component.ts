import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.scss']
})
export class MyWalletComponent implements OnInit {

  constructor(private _script: ScriptLoaderService) { }

  ngOnInit() {

    let scripts = [];
    scripts = [
      "../../assets/js/main.js",
    ];

    this._script.loadScripts("app-my-wallet", scripts).then(function () {

    })

  }

}
