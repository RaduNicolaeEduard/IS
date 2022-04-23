import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MaterialModule} from '../modules/material/material.module'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbChatModule,NbButtonModule, NbTabsetModule,NbIconModule, NbCardModule, NbFormFieldModule, NbInputModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NewintencomponentComponent } from './newintencomponent/newintencomponent.component';
import { WebcamModule } from 'ngx-webcam';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminComponent } from './admin/admin.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './init/keycloak-init';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
@NgModule({
  declarations: [
    AppComponent,
    NewintencomponentComponent,
    ChatbotComponent,
    AdminComponent,
    BottomSheetComponent
  ],
  imports: [
    WebcamModule,
    MaterialModule,
    BrowserModule,
    KeycloakAngularModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbChatModule,
    HttpClientModule,
    NbTabsetModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbButtonModule,
    FormsModule
  ],
  providers: [    {
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [KeycloakService],
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
