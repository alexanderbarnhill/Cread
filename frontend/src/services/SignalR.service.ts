import {Injectable} from "@angular/core";
import * as signalR from "@aspnet/signalr";
import {Message} from "../models/Message.model";
import {User} from "../models/User.model";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;
  private apiUrl = "https://localhost:5001/chat"

  public startConnection() {
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

}
