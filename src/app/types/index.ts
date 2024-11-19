export interface Todo {
  id: string
  text: string
  completed: boolean
  category: 'personal' | 'work' | 'health' | 'learning'
  dueDate?: string
}

export interface Goal {
  name: string
  progress: number
  target: number
  color: string
} 