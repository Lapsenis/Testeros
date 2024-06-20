using System.Threading.Channels;

namespace Taskero.Utils.Logging
{
    public class Logger
    {
        private readonly string _filePath;
        private readonly Channel<LogMessage> _channel;
        private readonly CancellationTokenSource _cancellationTokenSource;

        public Logger(string filePath)
        {
            _filePath = filePath;
            _channel = Channel.CreateUnbounded<LogMessage>();
            _cancellationTokenSource = new CancellationTokenSource();
            Task.Factory.StartNew(ProcessLogQueueAsync, TaskCreationOptions.LongRunning);
        }

        public async void Log(string message)
        {
            await _channel.Writer.WriteAsync(new LogMessage(message));
        }

        private async Task ProcessLogQueueAsync()
        {
            await foreach (var logMessage in _channel.Reader.ReadAllAsync(_cancellationTokenSource.Token))
            {
                var flatLogLine = logMessage.ToString().ReplaceLineEndings("") + Environment.NewLine;
                await File.AppendAllTextAsync(_filePath, flatLogLine, _cancellationTokenSource.Token);
            }
        }

        public void Stop()
        {
            _cancellationTokenSource.Cancel();
        }
    }
}
