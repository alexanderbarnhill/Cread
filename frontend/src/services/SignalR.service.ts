import {Injectable} from "@angular/core";
import * as signalR from "@aspnet/signalr";
import {Message} from "../models/Message.model";
import {User} from "../models/User.model";
import {Chat} from "../models/Chat.model";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;
  public connection = false;
  private apiUrl = "https://localhost:5001/chat"

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl)
      .build()

    this.hubConnection
      .start()
      .then( () => {
        this.connection = true;
      })
      .catch( (err) => {
        console.log(`Error while starting connection: ${err}`);
      });
  }

  public broadcast(message: Message) {
    this.hubConnection.invoke("broadcast", message)
      .catch( (err) => {
        console.log(`Error broadcasting: ${err}`);
      })
  }

  public addBroadcastListener() {
    this.hubConnection.on("broadcast", (data) => {
      console.log(data);
    });
  }

  public addUser(user: User) {
    this.hubConnection.invoke("addUser", user)
      .catch((err) => {
        console.log(`Error adding user: ${err}`);
      })
  }

  public openGroup(chatTab: Chat) {
    console.log(chatTab);
    this.hubConnection.invoke("openGroup", chatTab)
      .catch( (err) =>{
        console.log(`Error opening group ${err}`)
      })
  }

  public addOpenGroupListener() {
    this.hubConnection.on("openGroup", (data) => {
      console.log(data);
    })
  }

  public sendMessage(message: Message) {
    this.hubConnection.invoke("sendToGroup", message)
      .catch( (err) => {
        console.log(`Error sending a message to the group ${err}`);
      })
  }

  public addMessageListener() {
    this.hubConnection.on("sendToGroup", (data: Message) => {
      console.log(data);
    })
  }

  public leaveGroup(chat: Chat) {
    this.hubConnection.invoke('leaveGroup', chat)
      .catch( (err) => {
        console.log(`Error leaving the group: ${err}`);
      });
  }

  public removeUser(user: User) {
    this.hubConnection.invoke("removeUser", user)
      .catch( (err) => {
        console.log(`Error removing user: ${err}`);
      })
  }



}
