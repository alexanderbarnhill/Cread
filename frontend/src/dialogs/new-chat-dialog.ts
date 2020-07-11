import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NewChatDialogData} from "../models/NewChatDialogData.model";

@Component({
  selector: 'new-chat-dialog',
  templateUrl: 'new-chat-dialog.html',
})
export class NewChatDialog {
  constructor(
    public dialogRef: MatDialogRef<NewChatDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: NewChatDialogData) {}

  public submit() {
    console.log('Submit was..done')
    this.dialogRef.close();
  }
}
