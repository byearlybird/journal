import { tasksRepo, type Task, type NewTask } from "@app/db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { compareDesc, isToday, parseISO } from "date-fns";

const TASKS_QUERY_KEY = ["tasks"];

export function useTasksToday() {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "today"],
    queryFn: async (): Promise<Task[]> => {
      const tasks = await tasksRepo.findAll();
      return tasks
        .filter((task) => isToday(parseISO(task.created_at)))
        .sort((a, b) => compareDesc(parseISO(a.created_at), parseISO(b.created_at)));
    },
  });
}

export function useIncompleteTasks() {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "incomplete"],
    queryFn: async (): Promise<Task[]> => {
      const tasks = await tasksRepo.findAll();
      return tasks
        .filter((task) => task.status === "incomplete")
        .sort((a, b) => compareDesc(parseISO(a.created_at), parseISO(b.created_at)));
    },
  });
}

export function useIncompletePastDueTasks() {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "incomplete", "pastDue"],
    queryFn: async (): Promise<Task[]> => {
      const tasks = await tasksRepo.findAll();
      return tasks
        .filter((task) => task.status === "incomplete" && !isToday(parseISO(task.created_at)))
        .sort((a, b) => compareDesc(parseISO(a.created_at), parseISO(b.created_at)));
    },
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: async (task: Pick<NewTask, "content">) => {
      return await tasksRepo.create({
        content: task.content,
        scope: "daily",
      });
    },
  });
}

export function useUpdateTaskStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      return await tasksRepo.update(id, { status });
    },
  });
}
