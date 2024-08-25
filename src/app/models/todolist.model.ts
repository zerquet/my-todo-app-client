import { Todo } from "./todo.model";

export interface TodoList {
    id?: number;
    title?: string;
    todoItems: Todo[];
    totalCount?: number;
}