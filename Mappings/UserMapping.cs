using System.Collections.Generic;
using System.Linq;

namespace Cread.Models
{
    public class UserMapping<T>
    {
        private readonly Dictionary<T, User> _connections = new Dictionary<T, User>();
        public int Count => _connections.Count;
        
        public void Add(T key, User user)
        {
            lock (_connections)
            {
                _connections.Add(key, user);

            }
        }

        public void Remove(T key)
        {
            lock (_connections)
            {

                _connections.Remove(key);
            }
        }

        public User Get(T key)
        {
            lock (_connections)
            {
                return _connections[key];
            }
        }

        public List<User> GetUsers()
        {
            lock (_connections)
            {
                return _connections.Values.ToList();
            }

        }
        
    }
}