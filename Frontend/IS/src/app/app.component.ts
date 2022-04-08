import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private httpClient: HttpClient) { }
  title = 'IS';
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

