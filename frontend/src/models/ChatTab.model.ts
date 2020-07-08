import {Message} from "./Message.model";

export interface ChatTab {
  name: string;
  id: string;
  messages: Array<Message>;
}
