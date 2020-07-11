using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cread.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Cread.Hubs
{
    public class ChatHub : Hub
    {   
        private static readonly ConnectionMapping<string> _connections = 
            new ConnectionMapping<string>();
        
        private static readonly UserMapping<string> _users = new UserMapping<string>();
        

        public async Task Broadcast(Message message)
        {
            await Clients.All.SendAsync("broadcast", message);
        }

        public void SendMessage(string id, string message)
        {
            foreach (var connectionId in _connections.GetConnections(id))
            {
                Clients.Client(connectionId).SendAsync("receiveMessage", message);
            }
        }

        public async Task AddUser(User user)
        {
            var connectionId = Context.ConnectionId;
            user.ConnectionId = connectionId;
            _connections.Add(user.Id, connectionId);
            _users.Add(connectionId, user);
            await Clients.All.SendAsync("addUser", _users.GetUsers());
        }

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

        public async Task SendToGroup(Message message)
        {
            await Clients.Group(message.ChatId).SendAsync("sendToGroup", message);
        }

        public async Task LeaveGroup(Chat chat)
        {
            var connectionId = Context.ConnectionId;
            var leavingUser = _users.Get(connectionId);
            
            await Clients.Group(chat.Id).SendAsync("leaveGroup", chat, leavingUser);
            foreach (var user in chat.Users)
            {
                await Groups.RemoveFromGroupAsync(user.ConnectionId, chat.Id);
            }
        }

        public async Task RemoveUser(User user)
        {
            var connectionId = Context.ConnectionId;
            _users.Remove(connectionId);
            _connections.Remove(user.Id, connectionId);
            
            await Clients.All.SendAsync("removeUser", _users.GetUsers());
        }
        
        
    }
}