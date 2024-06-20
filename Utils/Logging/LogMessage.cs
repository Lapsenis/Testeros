namespace Taskero.Utils.Logging
{
    public class LogMessage(string message)
    {
        public DateTime Timestamp { get; } = DateTime.UtcNow;
        public string Message { get; } = message;

        public override string ToString()
        {
            return $"{Timestamp:yyyy-MM-dd HH:mm:ss.fff} - {Message}";
        }
    }
}
