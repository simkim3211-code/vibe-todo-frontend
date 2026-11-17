import type { Todo } from '../types/todo'

const API_BASE = import.meta.env.VITE_API_BASE as string

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string }
    return data.message ?? '요청에 실패했습니다.'
  } catch {
    return '요청에 실패했습니다.'
  }
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_BASE, { cache: 'no-store' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateTodo(id: string, title: string): Promise<Todo> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await parseError(res))
}
