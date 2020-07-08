using System;

namespace Cread.Models
{
    public class Message
    {
        public string id { get; set; }
        public User Sender { get; set; }
        public User Receiver { get; set; }
        public string Content { get; set; }
        public string TimeSent { get; set; }
    }
}