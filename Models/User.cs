using System.Collections.Generic;

namespace Cread.Models
{
    public class User
    {    
        public string Id { get; set; }
        public string Name { get; set; }
        public string ConnectionId { get; set; }
        public List<Chat> Chats { get; set; }

        public User()
        {
            Chats = new List<Chat>();
        }
    }
}