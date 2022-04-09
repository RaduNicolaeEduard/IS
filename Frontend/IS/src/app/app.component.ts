import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable, throwError } from 'rxjs';
import { NewintencomponentComponent } from './newintencomponent/newintencomponent.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient) { }
  ngOnInit(): void {
    this.init()
  }
  intentsList: any = [];
  title = 'IS';
  intents: Array<any> = []
  messages: any[] = [
    {
      text: 'Hello There!',
      date: new Date(),
      reply: false,
      user: {
        name: 'Bot',
        avatar: 'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
      },
    },
  ];
  init() {
    this.intents = [];
    this.httpClient.get<any>(`http://localhost:3000/intents`).subscribe(intents => {
      intents = JSON.parse(JSON.stringify(intents.intents))
      this.intentsList = intents;
      for (let i = 0; i < intents.length; i++) {
        const intentkey = String(intents[i]);
        this.httpClient.get<any>(`http://localhost:3000/intent?intent=${intentkey}`).subscribe(intent => {
          // console.log("a")
          // console.log(intent)
          this.intents.push(intent);
          console.log(this.intents)
        })
      }
    })
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(NewintencomponentComponent, {
      width: '250px',
      data: {},
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        const body = { intents: [...this.intentsList, result] }
        this.httpClient.post<any>(`http://localhost:3000/intents`, body)
          .subscribe(data => {
            console.log(data)
            this.init()
          }
          );
      }
      console.log(result)
    });
  }
  retrainModel(){
    this.httpClient.get<any>(`http://localhost:3000/save`)
    .subscribe(data => {
      console.log(data)
    }
    );
  }
  updatedIntent(intent: any, intentIndex: any) {
    const body = this.intents[intentIndex].intent;
    this.httpClient.post<any>(`http://localhost:3000/intent?intent=${intent}`, body)
      .subscribe(data => console.log(data));
  }
  addIntent(intentIndex: any, type: any, intent: any) {
    switch (type) {
      case "question":
        this.intents[intentIndex].intent.questions.push("")
        break;
      case "answer":
        this.intents[intentIndex].intent.answers.push("")
        break;

    }
    const body = this.intents[intentIndex].intent;
    console.log(intent)
    this.updatedIntent(intent, intentIndex)
  }
  trackByFn(index: any, item: any) { return index; }
  deleteIntent(intentIndex: any, type: any, index: any, intent: any) {
    switch (type) {
      case "question":
        if (index > -1) {
          this.intents[intentIndex].intent.questions.splice(index, 1);
        }
        break;
      case "answer":
        this.intents[intentIndex].intent.answers.splice(index, 1);
        break;

    }
    this.updatedIntent(intent, intentIndex)
    console.log(type, intentIndex, index)
  }
  async sendMessage(event: any) {
    this.messages.push({
      text: event.message,
      date: new Date(),
      reply: true,
      user: {
        name: 'you',
        avatar: 'https://i.pravatar.cc/300',
      },
    });
    let text = String(event.message)
    this.httpClient.get<any>(`http://localhost:3000?message=${text}`).subscribe(data => {
      console.log(data)
      this.messages.push({
        text: data.response,
        date: new Date(),
        reply: false,
        user: {
          name: 'Bot',
          avatar: 'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
        },
      })
    })
  }
}

