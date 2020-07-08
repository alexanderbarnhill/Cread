import {Component, Input, OnInit} from '@angular/core';
import {User} from "../models/User.model";
import {ChatTab} from "../models/ChatTab.model";
import {Message} from "../models/Message.model";
import {FormControl} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {Utils} from "../services/Utils.service";
import {UserInfoDialog} from "../dialogs/user-info-dialog";
import {NewChatDialog} from "../dialogs/new-chat-dialog";
import {SignalRService} from "../services/SignalR.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showFiller = false;

  constructor(public dialog: MatDialog, private utils: Utils, private signalRService: SignalRService) {
  }

  public users: Array<User> = new Array<User>();
  public userChats: Array<ChatTab> = new Array<ChatTab>();
  public selectedTab = new FormControl(0);
  public chatTabs: Array<ChatTab> = new Array<ChatTab>();
  public currentUser: User;

  public ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.hubConnection
      .on("addUser", (data: User) => {
        console.log(data);
    });

    const systemTab: ChatTab = {
      name: "System",
      messages: new Array<Message>(),
      id: this.utils.uuid4()
    }

    this.chatTabs.push(systemTab);
    this.getUserInfo();
  }

  public openChat(user: User | undefined) {
    const chatTab: ChatTab = {
      name: user && user.name || "(New Chat)",
      messages: new Array<Message>(),
      id: this.utils.uuid4()
    }

    this.chatTabs.push(chatTab);
    console.log(this.chatTabs);
    this.selectedTab.setValue(this.chatTabs.length - 1);

    if (user === undefined) {
      let dialogRef = this.dialog.open(NewChatDialog, {
        data: {name: '', message: ''}
      });

      dialogRef.beforeClosed().subscribe( result => {
        if (this.isValid(result)) {
          dialogRef = this.dialog.open(
            UserInfoDialog, {
              data: {name: '', message: 'That name does not exist. Please try another'}
            }
          )
        }
      })

      dialogRef.afterClosed().subscribe( result => {
        chatTab.name = result;
      })
    }
  }

  public getUserInfo() {
    let dialogRef = this.dialog.open(
      UserInfoDialog, {
        data: {name: '', message: ''},
      }
    );

    dialogRef.beforeClosed().subscribe( result => {
      if (!this.isValid(result)) {
        dialogRef = this.dialog.open(
          UserInfoDialog, {
            data: {name: '', message: 'That name is invalid or already taken. Please try another.'}
          }
        )
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      this.currentUser = {
        id: this.utils.uuid4(),
        name: result
      }
      this.users.push(this.currentUser);
      this.signalRService.addUser(this.currentUser);
    });
  }

  public isValid(name: string) {
    if (name === '') {
      return false;
    }
    const user: User = this.users.find( x => x.name === name);
    return user === undefined;
  }

  public closeTab(tab: ChatTab, index: number) {
    this.chatTabs.splice(index, 1);
  }
}
