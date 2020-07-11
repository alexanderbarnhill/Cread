using System.Collections.Generic;

namespace Cread.Models
{
    public class Chat
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<Message> Messages { get; set; }
        public List<User> Users { get; set; }
    }
}