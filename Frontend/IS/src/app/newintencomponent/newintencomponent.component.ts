import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-newintencomponent',
  templateUrl: './newintencomponent.component.html',
  styleUrls: ['./newintencomponent.component.scss']
})
export class NewintencomponentComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NewintencomponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
