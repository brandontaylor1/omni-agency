import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/lib/supabase/client';
import { CalendarTask } from '@/types/calendar';

interface TasksPanelProps {
  loading: boolean;
  selectedDate: Date;
  dailyTasks: CalendarTask[];
  onTasksChange: () => Promise<void>;
}

export function TasksPanel({ loading, selectedDate, dailyTasks, onTasksChange }: TasksPanelProps) {
  const { currentOrganization } = useOrganization();
  const selectedDateKey = selectedDate.toISOString().slice(0, 10);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 px-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('task') as HTMLInputElement;
              const task = input.value.trim();

              if (!task || !currentOrganization?.id) return;

              try {
                const { error } = await supabase
                  .from('calendar_tasks')
                  .insert([{
                    organization_id: currentOrganization.id,
                    title: task,
                    date: selectedDateKey,
                    completed: false
                  }]);

                if (error) throw error;

                form.reset();
                await onTasksChange();
              } catch (err) {
                console.error('Error adding task:', err);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="task"
              className="flex-1 border rounded px-2 py-1"
              placeholder="Add a new task..."
            />
            <button
              type="submit"
              className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/80"
              disabled={loading}
            >
              Add
            </button>
          </form>
        </div>

        <div className="px-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
            </div>
          ) : dailyTasks.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              <p>No tasks for this day</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {dailyTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={async () => {
                        try {
                          const { error } = await supabase
                            .from('calendar_tasks')
                            .update({ completed: !task.completed })
                            .eq('id', task.id);

                          if (error) throw error;
                          await onTasksChange();
                        } catch (err) {
                          console.error('Error updating task:', err);
                        }
                      }}
                    />
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                      {task.title}
                    </span>
                  </label>
                  <button
                    className="text-xs text-red-500 hover:underline ml-2"
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('calendar_tasks')
                          .delete()
                          .eq('id', task.id);

                        if (error) throw error;
                        await onTasksChange();
                      } catch (err) {
                        console.error('Error deleting task:', err);
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
