import { useStorage } from './useStorage'
import { DEFAULT_TODO_COLOR } from '../constants/colors'

function uuid() {
  return crypto.randomUUID()
}

export function useTodos() {
  const [todos, setTodos] = useStorage('tk_todos', {})

  function getTodos(isoDate) {
    return todos[isoDate] || []
  }

  function addTodo(isoDate, label, color = DEFAULT_TODO_COLOR) {
    const newTodo = { id: uuid(), label: label.trim(), completed: false, color }
    setTodos(prev => ({
      ...prev,
      [isoDate]: [...(prev[isoDate] || []), newTodo],
    }))
  }

  function toggleTodo(isoDate, id) {
    setTodos(prev => ({
      ...prev,
      [isoDate]: (prev[isoDate] || []).map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }))
  }

  function deleteTodo(isoDate, id) {
    setTodos(prev => ({
      ...prev,
      [isoDate]: (prev[isoDate] || []).filter(t => t.id !== id),
    }))
  }

  return { todos, getTodos, addTodo, toggleTodo, deleteTodo }
}
