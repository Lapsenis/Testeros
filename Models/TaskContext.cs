using Microsoft.EntityFrameworkCore;

namespace Taskero.Models
{
    public class TaskItemContext : DbContext
    {
        public TaskItemContext(DbContextOptions<TaskItemContext> opt) :  base(opt) { }

        public DbSet<TaskItem> Tasks { get; set; } = null!;
    }
}
