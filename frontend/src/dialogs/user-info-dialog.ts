import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserDialogData} from "../models/UserDialogData.model";

@Component({
  selector: 'user-info-dialog',
  templateUrl: 'user-info-dialog.html',
})
export class UserInfoDialog {
  constructor(
    public dialogRef: MatDialogRef<UserDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    dialogRef.disableClose = true;
  }


    public submit() {
      this.dialogRef.close(this.data.name);
    }
}
