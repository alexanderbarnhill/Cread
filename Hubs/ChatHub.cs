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
        private readonly static ConnectionMapping<string> _connections = 
            new ConnectionMapping<string>();

        public async Task Broadcast(Message message)
        {
            await Clients.All.SendAsync("broadcast", message);
        }

        public async Task AddUser(User user)
        {
            _connections.Add(user.Id, Context.ConnectionId);
            
            await Clients.All.SendAsync("addUser", user);
        }
        
        
    }
}