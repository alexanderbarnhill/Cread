import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {User} from "../models/User.model";
import {Chat} from "../models/Chat.model";
import {Message} from "../models/Message.model";
import {FormControl} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {Utils} from "../services/Utils.service";
import {UserInfoDialog} from "../dialogs/user-info-dialog";
import {NewChatDialog} from "../dialogs/new-chat-dialog";
import {SignalRService} from "../services/SignalR.service";
import {MediaMatcher} from "@angular/cdk/layout";

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

  public title = 'Cread';
  public connection = 'DOWN';
  public systemUser: User;

  private readonly _mobileQueryListener: () => void;

  constructor(
    public dialog: MatDialog,
    private utils: Utils,
    private signalRService: SignalRService,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  public users: Array<User> = new Array<User>();
  public selectedTab = new FormControl(0);
  public chatTabs: Array<Chat> = new Array<Chat>();
  public currentUser: User;

  mobileQuery: MediaQueryList;

  /**
   * Starts the connection to the server, gets the user info, and sets up the initial broadcast tab
   */
  public ngOnInit(): void {
    this.signalRService.startConnection();
    this.setupListeners();

    const systemTab: Chat = {
      name: "All",
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
      connectionId: '',
      chats: new Map<string, Chat>()
    }
  }

  /**
   * Sets up listeners for the various tasks such as broadcasting and adding users.
   */
  public setupListeners(): void {
    this.signalRService.hubConnection
      .on("addUser", (data: Array<User>) => {
        this.users = data;
      });

    this.signalRService.hubConnection
      .on("removeUser", (data: Array<User>) => {
        this.users = data;
      });

    this.signalRService.hubConnection
      .on("sendToGroup", (data: Message) => {
        this.sendToChat(data);
      })

    this.signalRService.hubConnection
      .on('leaveGroup', (chat: Chat, leavingUser: User) => {
        this.informLeave(chat, leavingUser);
      });

    this.signalRService.hubConnection
      .on("broadcast", (message: Message) =>{
        const broadcastTab = this.chatTabs.find( (chat: Chat) => chat.name.toLowerCase() === 'all');
        if (broadcastTab !== undefined && message.sender.id !== this.currentUser.id) {
          broadcastTab.messages.push(message);
        }

      });
  }

  /**
   * Opens a chat either with a defined user, or looks for a user when given the name.
   * Adds both users to a group.
   * @param user or undefined, depending on if the sender wants to input the username
   */
  public openChat(user: User | undefined) {
    if (user.id === this.currentUser.id) return;
    if (this.chatTabs.find( (chat: Chat) => chat.users.find( (u: User) => u.id === user.id))) return;
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
        this.currentUser.chats.set(chatTab.id, chatTab);
      })
    } else {
      chatTab.users.push(user);
      this.currentUser.chats.set(chatTab.id, chatTab);
    }

    this.signalRService.openGroup(chatTab);
  }

  /**
   * Opens up a dialog at the beginning to get the username
   */
  public getUserInfo(): void {
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
        connectionId: '',
        chats: new Map<string, Chat>()
      }
      this.users.push(this.currentUser);
      this.signalRService.addUser(this.currentUser);
    });
  }

  /**
   * Checks if the username already exists
   * @param name - Username to check
   */
  public isValid(name: string): boolean {
    if (name === '') {
      return false;
    }
    const user: User = this.users.find( x => x.name === name);
    return user === undefined;
  }

  /**
   * Closes the given tab, given the index in the list.
   * @param tab
   * @param index
   */
  public closeTab(tab: Chat, index: number): void {
    this.currentUser.chats.set(tab.id, tab);
    this.chatTabs.splice(index, 1);
  }

  /**
   * Given a message, find the chat it belongs to and add it to the messages in that chat.
   * @param message
   */
  public sendToChat(message: Message): void {
    let chat: Chat = this.chatTabs.find( (chat: Chat) => chat.id === message.chatId);
    if (chat === undefined) {
      chat = this.currentUser.chats.get(message.chatId);
      if (chat === undefined) {
        chat = {
          id: message.chatId,
          messages: [message],
          name: message.sender.name,
          users: [this.currentUser, message.sender],
          newMessages: true
        }
      } else {
        // Chat exists but was closed
        chat.messages.push(message);
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

  /**
   * Alerts the user via a changing font color to new messages
   * @param chat
   */
  public alertNewMessage(chat: Chat): void {
    const chatIdx = this.chatTabs.indexOf(chat);
    const selectedIdx = this.selectedTab.value;
    if (chatIdx !== selectedIdx) {
      chat.newMessages = true;
    }
  }

  /**
   * The event fired when changing tabs. Used to acknowledge new messages.
   * @param $event
   */
  public changeTab($event): void {
    this.selectedTab.setValue($event)
    const chat = this.chatTabs[$event];
    chat.newMessages = false;
  }

  /**
   * Fired when opening up the user menu. Checks to see if there is an active connection to the server.
   */
  public checkConnection(): void {
    this.connection = this.signalRService.connection ? 'Active' : 'Inactive';
  }

  /**
   * Informs the other users in a group when someone leaves.
   * @param chat - Chat which the user has left.
   * @param leavingUser - User who is leaving
   */
  public informLeave(chat: Chat, leavingUser: User): void {
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

  /**
   * Upon exiting the application a notification is sent to the server and the remaining users
   * are informed that the current user has left.
   */
  public ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.signalRService.removeUser(this.currentUser);
  }
}
