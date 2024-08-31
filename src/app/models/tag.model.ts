import { Todo } from "./todo.model";

export interface Tag {
    id?: number;
    name?: string;
    colorCode?: string;
    todoItems: Todo[];
}