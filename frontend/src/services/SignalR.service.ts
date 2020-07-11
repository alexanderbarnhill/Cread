import {Injectable} from "@angular/core";
import * as signalR from "@aspnet/signalr";
import {Message} from "../models/Message.model";
import {User} from "../models/User.model";
import {Chat} from "../models/Chat.model";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;
  public connection = false;
  private apiUrl = `${environment.server}/chat`

  /**
   * Starts a connection with the server
   */
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

  /**
   * Sends a message to all users
   */
  public broadcast(message: Message) {
    this.hubConnection.invoke("broadcast", message)
      .catch( (err) => {
        console.log(`Error broadcasting: ${err}`);
      })
  }

  /**
   * Adds a new user to the application
   */
  public addUser(user: User) {
    this.hubConnection.invoke("addUser", user)
      .catch((err) => {
        console.log(`Error adding user: ${err}`);
      })
  }

  /**
   * Sets up a new group with multiple users. Here used as private messaging
   */
  public openGroup(chatTab: Chat) {
    console.log(chatTab);
    this.hubConnection.invoke("openGroup", chatTab)
      .catch( (err) =>{
        console.log(`Error opening group ${err}`)
      })
  }

  /**
   * Sends a message to a group
   */
  public sendMessage(message: Message) {
    this.hubConnection.invoke("sendToGroup", message)
      .catch( (err) => {
        console.log(`Error sending a message to the group ${err}`);
      })
  }

  /**
   * Removes the calling user from the group
   */
  public leaveGroup(chat: Chat) {
    this.hubConnection.invoke('leaveGroup', chat)
      .catch( (err) => {
        console.log(`Error leaving the group: ${err}`);
      });
  }

  /**
   * Removes the calling user from the application
   */
  public removeUser(user: User) {
    this.hubConnection.invoke("removeUser", user)
      .catch( (err) => {
        console.log(`Error removing user: ${err}`);
      })
  }



}
