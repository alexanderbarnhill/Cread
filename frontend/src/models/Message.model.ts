import {User} from "./User.model";

export interface Message {
  id: string;
  chatId: string;
  sender: User;
  receiver: User;
  content: string;
  timeSent: string;
}
