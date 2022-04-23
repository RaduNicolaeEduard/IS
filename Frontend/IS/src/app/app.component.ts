import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { withLatestFrom } from 'rxjs';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {

  constructor(private _bottomSheet: MatBottomSheet,protected keycloak: KeycloakService) {}
  loggedIn:boolean = false;
  isLoggedIn(){
    this.keycloak.isLoggedIn().then(data =>{
      this.loggedIn = data;
    })
  }
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }
  ngOnInit(): void {
    setInterval(() => {
      this.isLoggedIn() 
    }, 2000);
  }


}