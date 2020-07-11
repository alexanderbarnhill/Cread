import {Message} from "./Message.model";
import {User} from "./User.model";

export interface Chat {
  name: string;
  id: string;
  messages: Array<Message>;
  users: Array<User>;
  newMessages: boolean;
}
