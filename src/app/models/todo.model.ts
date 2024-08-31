import { Tag } from "./tag.model";

export interface Todo {
    id?: number;
    title?: string;
    description?: string;
    todoListId?: number;
    tags: Tag[];
    newTags: number[];
}