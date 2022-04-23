import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from "keycloak-angular";
@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>, private keycloak: KeycloakService,private router: Router) {}

  login(){
    this.keycloak.login({
      redirectUri: window.location.origin,
    });
    this._bottomSheetRef.dismiss(); 
  }
  logout(){           
    this.router.navigate([""])  
    setTimeout(() => {
      this.keycloak.logout().then(() => this.keycloak.clearToken());
    }, 200);
    this._bottomSheetRef.dismiss();
  }
  ngOnInit(): void {
    
  }

}
