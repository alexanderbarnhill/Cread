using System.Threading.Tasks;
using Cread.Models;
using Microsoft.AspNetCore.SignalR;

namespace Cread.Hubs
{
    public class ChatHub : Hub
    {

        /// <summary>
        /// UserMapping controlling the ConnectionIds and the users attached to them
        /// </summary>
        private static readonly UserMapping<string> _users = new UserMapping<string>();
        

        /// <summary>
        /// Sends a message to all users
        /// </summary>
        /// <param name="message">Message to be sent.</param>
        /// <returns></returns>
        public async Task Broadcast(Message message)
        {
            await Clients.All.SendAsync("broadcast", message);
        }
        
        /// <summary>
        /// Adds a user to the application. Sends a list of all active users to the frontend
        /// </summary>
        /// <param name="user">User to be added</param>
        /// <returns></returns>
        public async Task AddUser(User user)
        {
            var connectionId = Context.ConnectionId;
            user.ConnectionId = connectionId;
            _users.Add(connectionId, user);
            await Clients.All.SendAsync("addUser", _users.GetUsers());
        }

        /// <summary>
        /// Opens a group chat.
        /// TODO Reuse group chats.
        /// </summary>
        /// <param name="chat">Chat specifying members</param>
        /// <returns></returns>
        public async Task OpenGroup(Chat chat)
        {
            foreach (var user in chat.Users)
            {
                if (!user.ConnectionId.Equals(""))
                {
                    await Groups.AddToGroupAsync(user.ConnectionId, chat.Id);
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, chat.Id);
            
            await Clients.Group(chat.Id).SendAsync("openGroup", $"{Context.ConnectionId} has joined the group {chat.Id}.");
            
        }

        /// <summary>
        /// Sends a message to a group.
        /// </summary>
        /// <param name="message">Message to send. Includes sender and receiver as well as content.</param>
        /// <returns></returns>
        public async Task SendToGroup(Message message)
        {
            await Clients.Group(message.ChatId).SendAsync("sendToGroup", message);
        }

        /// <summary>
        /// The method called when using the 'close chat' button. This is then used to inform the other
        /// group members that the user has left the chat.
        /// </summary>
        /// <param name="chat">Chat with members</param>
        /// <returns></returns>
        public async Task LeaveGroup(Chat chat)
        {
            var connectionId = Context.ConnectionId;
            var leavingUser = _users.Get(connectionId);
            // TODO use OthersInGroup method to simplify frontend
            await Clients.Group(chat.Id).SendAsync("leaveGroup", chat, leavingUser);
            foreach (var user in chat.Users)
            {
                await Groups.RemoveFromGroupAsync(user.ConnectionId, chat.Id);
            }
        }

        /// <summary>
        /// Upon closing the window or exiting the application this is called to make sure the other users
        /// no longer see the user who has left.
        /// </summary>
        /// <param name="user">User who has left the application.</param>
        /// <returns></returns>
        public async Task RemoveUser(User user)
        {
            var connectionId = Context.ConnectionId;
            _users.Remove(connectionId);
            await Clients.All.SendAsync("removeUser", _users.GetUsers());
        }
        
        
    }
}