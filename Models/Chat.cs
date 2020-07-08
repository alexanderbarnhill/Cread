using System.Collections.Generic;

namespace Cread.Models
{
    public class Chat
    {
        public long Id { get; set; }
        public List<Message> Messages { get; set; }
        public List<User> Users { get; set; }
    }
}