using System.Collections.Concurrent;

namespace Taskero.Utils.Logging
{
    public class LoggerFactory
    {
        private readonly ConcurrentDictionary<string, Logger> _loggers = new();

        private LoggerFactory() { }

        private static readonly Lazy<LoggerFactory> _instance = new(() => new LoggerFactory());

        public static LoggerFactory Instance => _instance.Value;

        public Logger GetOrAdd(string name, string filePath)
        {
            return _loggers.GetOrAdd(name, _ => new Logger(filePath));
        }

        public void StopAll()
        {
            foreach (var logger in _loggers.Values)
            {
                logger.Stop();
            }
        }
    }
}
