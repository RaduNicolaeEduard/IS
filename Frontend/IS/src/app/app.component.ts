import { Component, Inject, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NbDialogService, NbThemeService } from '@nebular/theme';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { withLatestFrom } from 'rxjs';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { CookieService } from 'ngx-cookie-service';
import { GdprComponent } from './gdpr/gdpr.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {DOCUMENT} from "@angular/common";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private _renderer: Renderer2,
    public translate: TranslateService,
    public dialog: MatDialog,
    private themeService: NbThemeService,
    private _bottomSheet: MatBottomSheet,
    protected keycloak: KeycloakService,
    private cookieService: CookieService,
  ) {
    translate.addLangs(['en', 'fr', 'ro','cr']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');
    this.language = browserLang?.match(/en|fr/) ? browserLang : 'en';
  }
  language: string = "en";
  loggedIn: boolean = false;
  themeState: any = 'default';
  gdpr: any = false;
  isLoggedIn() {
    this.keycloak.isLoggedIn().then((data) => {
      this.loggedIn = data;
    });
  }
  themeChange(theme: string) {
    this.themeService.changeTheme(theme);
    this.themeState = theme;
    if (this.gdpr) {
      this.cookieService.set('theme', theme);
      if(this.themeState =="dark"){

        this._renderer.addClass(document.body, 'dark-theme');
        this._renderer.removeClass(document.body, 'light-theme');
      }else{
        this._renderer.addClass(document.body, 'ligt-theme');
        this._renderer.removeClass(document.body, 'dark-theme');
      }
    }
  }
  changeLang() {
    this.translate.use(this.language);
    if (this.gdpr) {
      this.cookieService.set('lang', this.language);
    }
  }
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }
  ngOnInit(): void {
    this.gdpr = this.cookieService.get('gdpr');
    if (this.gdpr == '') {
      this.open();
    }
    if (this.gdpr) {
      let theme = this.cookieService.get('theme');
      let lang = this.cookieService.get('lang');
      if (lang != '') {
        this.language = lang;
        this.changeLang();
      }
      if (theme != '') {
        this.themeState = theme;
        this.themeChange(theme);
      }
    }

    setInterval(() => {
      this.isLoggedIn();
    }, 2000);
  }
  open() {
    const dialogRef = this.dialog.open(GdprComponent, { disableClose: true });

    dialogRef.afterClosed().subscribe((result) => {
      this.cookieService.set('gdpr', result);
    });
  }
}
