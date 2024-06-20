namespace Taskero.Models
{
    public enum Priority
    {
        Low,
        Medium,
        High
    }

    public enum Status
    {
        Pending,
        InProgress,
        Completed,
        Archived
    }

    public class TaskItem
    {
        public long Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }

        public Priority Priority { get; set; }
        public DateTime Due { get; set; }
        public Status Status { get; set; }
    }
}
