import {Chat} from "./Chat.model";

export interface User {
  id: string;
  name: string;
  connectionId: string;
  chats: Map<string, Chat>
}
