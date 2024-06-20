The application can be configured using `appsettings.json`. The Testero web app requires the following settings, which are already present in the provided `appsettings.json` file:

    "ConnectionStrings": {
        "DefaultConnection": "Data Source=SQLLiteDatabase.db"
      }
      "RequestLogging": {
        "LogFilePath": "Requests.txt"
      },
      "Tasks": {
        "CriticalLogPath": "CriticalTasks.txt"
      }

Here are the steps to set up the project:

-  **Open Solution and Restore Dependencies**:
    -   Use Visual Studio 2022 to open the solution.
    -   Restore dependencies using NuGet.

-  **Database Setup**:
    -   Initialized SQLite database is provided with the project.
    -   If you prefer to use a different SQLite database, create a new db and initialize it using the provided migrations
        
        `dotnet ef database update`
 
- **Run Testero web app**
    - Open the project in Visual Studio and run it as debug.
    - Open your web browser and navigate to index.html. By default, the Swagger page will be displayed.
    - If you see a plain and empty page with some green and orange elements, try creating new tasks to populate it.
