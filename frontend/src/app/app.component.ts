import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {User} from "../models/User.model";
import {Chat} from "../models/Chat.model";
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
export class AppComponent implements OnInit, OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler() {
    this.signalRService.removeUser(this.currentUser);
  }

  title = 'Cread';
  connection = 'DOWN';
  systemUser: User;

  constructor(
    public dialog: MatDialog,
    private utils: Utils,
    private signalRService: SignalRService
  ) {}

  public users: Array<User> = new Array<User>();
  public selectedTab = new FormControl(0);
  public chatTabs: Array<Chat> = new Array<Chat>();
  public currentUser: User;

  public ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.addOpenGroupListener();
    this.signalRService.addMessageListener();
    this.signalRService.hubConnection
      .on("addUser", (data: Array<User>) => {
        this.users = data;
    });

    this.signalRService.hubConnection
      .on("sendToGroup", (data: Message) => {
        this.sendToChat(data);
    })

    this.signalRService.hubConnection
      .on("removeUser", (data: Array<User>) => {
        this.users = data;
      });

    this.signalRService.hubConnection
      .on('leaveGroup', (chat: Chat, leavingUser: User) => {
        console.log(chat);
        console.log(leavingUser);
        this.informLeave(chat, leavingUser);
      });

    const systemTab: Chat = {
      name: "System",
      messages: new Array<Message>(),
      id: this.utils.uuid4(),
      users: [],
      newMessages: false
    }

    this.chatTabs.push(systemTab);
    this.getUserInfo();

    this.systemUser = {
      name: 'SYSTEM',
      id: this.utils.uuid4(),
      connectionId: ''
    }
  }

  public openChat(user: User | undefined) {
    const chatTab: Chat = {
      name: user && user.name || "(New Chat)",
      messages: new Array<Message>(),
      id: this.utils.uuid4(),
      users: [this.currentUser],
      newMessages: false
    }

    this.chatTabs.push(chatTab);
    this.selectedTab.setValue(this.chatTabs.length - 1);

    if (user === undefined) {
      let dialogRef = this.dialog.open(NewChatDialog, {
        data: {name: '', message: ''}
      });

      dialogRef.beforeClosed()
        .subscribe( result => {
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
        user = this.users.find( (u: User) => u.name == result);
        chatTab.users.push(user);
        this.signalRService.openGroup(chatTab);
      })
    } else {
      chatTab.users.push(user);
    }

    this.signalRService.openGroup(chatTab);
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
        name: result,
        connectionId: ''
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

  public closeTab(tab: Chat, index: number) {
    this.chatTabs.splice(index, 1);
  }

  public sendToChat(message: Message) {
    let chat: Chat = this.chatTabs.find( (chat: Chat) => chat.id === message.chatId);
    if (chat === undefined) {
      chat = {
        id: message.chatId,
        messages: [message],
        name: message.sender.name,
        users: [this.currentUser, message.sender],
        newMessages: true
      }

      this.chatTabs.push(chat);
      this.alertNewMessage(chat);
    } else {
      if (message.sender.id !== this.currentUser.id) {
        chat.messages.push(message);
        this.alertNewMessage(chat);
      }
    }
  }

  public alertNewMessage(chat: Chat) {
    const chatIdx = this.chatTabs.indexOf(chat);
    const selectedIdx = this.selectedTab.value;
    if (chatIdx !== selectedIdx) {
      chat.newMessages = true;
    }
  }

  public changeTab($event) {
    this.selectedTab.setValue($event)
    const chat = this.chatTabs[$event];
    chat.newMessages = false;
  }

  public checkConnection() {
    this.connection = this.signalRService.connection ? 'Active' : 'Inactive';
  }

  public informLeave(chat: Chat, leavingUser: User) {
    if (this.currentUser.id !== leavingUser.id) {
      const chatTab = this.chatTabs.find( (c: Chat) => c.id === chat.id);
      if (chatTab !== undefined) {
        const receiver: User = chatTab.users.find( (u: User) => u.id !== leavingUser.id);
        if (receiver !== undefined) {
          const message: Message = {
            content: `${leavingUser.name} has left.`,
            chatId: chat.id,
            sender: this.systemUser,
            id: this.utils.uuid4(),
            receiver: receiver,
            timeSent: new Date().toLocaleString()

          }
          chatTab.messages.push(message);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.signalRService.removeUser(this.currentUser);
  }
}
