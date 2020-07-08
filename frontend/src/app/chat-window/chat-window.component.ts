import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Message} from "../../models/Message.model";
import {User} from "../../models/User.model";
import {SignalRService} from "../../services/SignalR.service";
import {ChatTab} from "../../models/ChatTab.model";
import * as signalR from "@aspnet/signalr";
import {Utils} from "../../services/Utils.service";

class Messages {
}


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {

  @Input() messages: Array<Message> = new Array<Message>();
  @Input() currentUser: User;
  @Input() chatTab: ChatTab;

  @Output() closeChatClicked = new EventEmitter<any>();

  private hubConnection: signalR.HubConnection;
  private apiUrl = "https://localhost:5001/chat"


  constructor(private signalRService: SignalRService, private utils: Utils) { }

  ngOnInit(): void {
    this.setupConnection();
    if (this.chatTab.name.toLowerCase() === "system") {
      this.addBroadcastListener();
    }
  }

  public trigger(event: any) {
    const text = document.getElementById("message-area");
    if (event.ctrlKey && event.key === 'Enter') {
      // @ts-ignore
      text.value += '\n';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // @ts-ignore

      const receiver: User = {
        name: this.chatTab.name
      }

      // @ts-ignore
      const messageContent = text.value;

      const message: Message = {
        id: this.utils.uuid4(),
        content: messageContent,
        receiver: receiver,
        sender: this.currentUser,
        timeSent: new Date().toLocaleString()
      }

      this.messages.push(message);
      this.send(message);

      const chatWindow = document.getElementById("chat-window");

      chatWindow.scrollTop = chatWindow.scrollHeight;

      // @ts-ignore
      text.value = '';
    }
  }

  public closeTab() {
    this.closeChatClicked.emit();
  }

  public send(message: Message) {
    if (message.receiver.name.toLowerCase() === "system") {
      console.log('Broadcasting...');
      this.signalRService.broadcast(message);
    }
  }

  private setupConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl)
      .build()

    this.hubConnection
      .start()
      .then( () => {
        console.log('Connection Started');
      })
      .catch( (err) => {
        console.log(`Error while starting connection: ${err}`);
      });
  }

  public addBroadcastListener() {
    this.hubConnection.on("broadcast", (data: Message) => {
      const message = this.messages.find( (m: Message) => m.id === data.id);
      if (message === undefined) {
        this.messages.push(data);
      }
    });
  }
}
