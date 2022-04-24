import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { NewintencomponentComponent } from '../newintencomponent/newintencomponent.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  dialogRef: any;
  readonly imageTrigger: Subject<void> = new Subject<void>();
  error?: string;
  constructor(
    public dialog: MatDialog,
    private httpClient: HttpClient) { }
    ngOnInit(): void {
      this.init()
    }
  @ViewChild('callAPIDialog') callAPIDialog: any;
  intentsList: any = [];
  form:any;
  loading:boolean = false;
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
  callAPI() {
    this.dialogRef = this.dialog.open(this.callAPIDialog);
    this.dialogRef.afterClosed().subscribe((result:any) => {
      var file = this.dataURLtoFile(result,'hello.png');
      if(file != undefined){
        this.loading = true;
        this.messages.push({
          text: "File Question",
          files: [ { url: 'https://picsum.photos/320/240/?image=387', type: 'image/jpeg' } ],
          date: new Date(),
          reply: true,
          user: {
            name: 'you',
            avatar: 'https://i.pravatar.cc/300',
          },
        });
        this.upload(file).subscribe(
          data => {
            this.loading = false;
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
        console.log(result)
      }
    })
}
  captureImage(webcamImage: WebcamImage): void {
    this.dialogRef.close(webcamImage.imageAsDataUrl);
  }

  triggerSnapshot(): void {
    this.imageTrigger.next();
  }

  handleInitError(error: WebcamInitError): void {
    console.warn(error);
    this.error = JSON.stringify(error);
  }
  dataURLtoFile(dataurl:any, filename:any) {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}
  init() {
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(NewintencomponentComponent, {
      width: '250px',
      data: {},
    });
    dialogRef.afterClosed().subscribe(result => {
      
      if (result) {
        const body = { intents: [...this.intentsList, result] }
        this.httpClient.post<any>(`${environment.BASE_PATH}/api/intents`, body)
          .subscribe(data => {
            
            this.init()
          }
          );
      }
      
    });
  }
  retrainModel(){
    this.httpClient.get<any>(`${environment.BASE_PATH}/api/save`)
    .subscribe(data => {
      
    }
    );
  }
  updatedIntent(intent: any, intentIndex: any) {
    const body = this.intents[intentIndex].intent;
    this.httpClient.post<any>(`${environment.BASE_PATH}/api/intent?intent=${intent}`, body)
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
    
  }
  onFileInput(event:any){
    console.log(this.form)
    console.log(event.target.files)
    this.sendMessage({"files":event.target.files,"message":""})
  }
  upload(data:any) {
    const url = `${environment.BASE_PATH}/api/upload`;
    let input = new FormData();
    input.append('busyboy', data);   // "url" as the key and "data" as value
    return this.httpClient.post(url, input).pipe(map((resp: any) => resp));
  }
  async sendMessage(event: any) {
    if(event?.files.length != 0 ){
      this.messages.push({
        text: "File Question",
        files: [ { url: 'https://picsum.photos/320/240/?image=387', type: 'image/jpeg' } ],
        date: new Date(),
        reply: true,
        user: {
          name: 'you',
          avatar: 'https://i.pravatar.cc/300',
        },
      });
      this.loading = true;
      this.upload(event.files[0]).subscribe(
        data => {
          this.loading=false;
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
        return
    }
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
    this.httpClient.get<any>(`${environment.BASE_PATH}/api/?message=${text}`).subscribe(data => {
      
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

