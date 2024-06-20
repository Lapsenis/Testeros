/*
 *      Here are a few points about this implementation and my considerations:

        1)  Although there are existing libraries/APIs for logging incoming requests, 
            the development test required a custom middleware, so I created one.

        2)  In this simple case, log entries are written to a file by a simple logger, 
            which is sufficient for now. In a more robust application, 
            this should be handled by logging libraries, such as MS Logging API and Serilog etc.

        3)  I kept this middleware simple to ensure it remains agnostic 
            to the specifics of the application logic and data models. 
            The detailed logging is handled by an ActionFilter. (Separation of Concerns) 
 */
using System.Text;

namespace Taskero.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Utils.Logging.Logger _logger;
        private readonly IConfiguration _configuration;

        public RequestLoggingMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;

            var logPath = _configuration["RequestLogging:LogFilePath"];

            if (string.IsNullOrEmpty(logPath))
                throw new Exception("Missing configuration for RequestLogging:LogFilePath");

            _logger = Utils.Logging.LoggerFactory.Instance.GetOrAdd("RequestLogger", logPath);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            context.Request.EnableBuffering();

            _logger.Log(GetRequestLogLine(context.Request));

            await _next(context);
        }

        private string GetRequestLogLine(HttpRequest request)
        {
            return $"Method: {request.Method}, " +
                $"Path: {request.Path}, " +
                $"QueryString: {request.QueryString}, " +
                $"RequestBody: {GetRequestBody(request).Result}";
        }

        private static async Task<string> GetRequestBody(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            return body;
        }
    }

    public static class LoggerExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
