using System;

namespace Cread.Models
{
    public class Message
    {
        public string Id { get; set; }
        public string ChatId { get; set; }
        public User Sender { get; set; }
        public User Receiver { get; set; }
        public string Content { get; set; }
        public string TimeSent { get; set; }
    }
}