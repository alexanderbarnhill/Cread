import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Message} from "../../models/Message.model";
import {User} from "../../models/User.model";
import {SignalRService} from "../../services/SignalR.service";
import {Chat} from "../../models/Chat.model";
import {Utils} from "../../services/Utils.service";


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {

  @Input() messages: Array<Message> = new Array<Message>();
  @Input() currentUser: User;
  @Input() chat: Chat;

  @Output() closeChatClicked = new EventEmitter<any>();
  constructor(private signalRService: SignalRService, private utils: Utils) { }

  /**
   * The mechanism for either sending a message to a receiver or creating a new line in the text box.
   * Just enter will send the message. ctrl-enter will create a new line.
   * @param event
   */
  public trigger(event: any): void {
    const text = document.getElementById("message-area");
    if (event.ctrlKey && event.key === 'Enter') {
      // @ts-ignore
      text.value += '\n';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // @ts-ignore

      const receiver: User = {
        name: this.chat.name
      }

      // @ts-ignore
      const messageContent = text.value;

      const message: Message = {
        chatId: this.chat.id,
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

  /**
   * Closes the tab and removes you from the group.
   */
  public closeTab() {
    this.closeChatClicked.emit();
    this.signalRService.leaveGroup(this.chat);
  }

  /**
   * Sends a message to the intended receiver. Either broadcasting it or sending it to a group.
   */
  public send(message: Message) {
    if (message.receiver.name.toLowerCase() === "all") {
      this.signalRService.broadcast(message);
    } else {
      this.signalRService.sendMessage(message);
    }
  }
}
