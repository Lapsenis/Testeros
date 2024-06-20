using Microsoft.AspNetCore.Mvc.Filters;
using Taskero.Models;

namespace Taskero.ActionFilters
{
    public class CriticalTaskLoggingAttribute : ActionFilterAttribute
    {
        private readonly Utils.Logging.Logger _logger;

        public CriticalTaskLoggingAttribute(IConfiguration configuration)
        {
            var logPath = configuration["Tasks:CriticalLogPath"];

            if (string.IsNullOrEmpty(logPath))
                throw new Exception("Missing configuration for Tasks:CriticalLogPath");

            _logger = Utils.Logging.LoggerFactory.Instance.GetOrAdd("CriticalTask", logPath);
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.ActionArguments.TryGetValue(nameof(TaskItem), out var obj))
            {
                var taskItem = obj as TaskItem;
                ProcessTaskLogging(context.HttpContext.Request, taskItem);
            }

            await next();
        }

        private void ProcessTaskLogging(HttpRequest request, TaskItem taskItem)
        {
            if (taskItem.Priority != Priority.High) { return; }

            if (request.Method == "POST")
                _logger.Log($"[Critical task created] Name: {taskItem.Title}");
            if (request.Method == "PUT")
                _logger.Log($"[Critical task updated] Name: {taskItem.Title}");
        }
    }
}
