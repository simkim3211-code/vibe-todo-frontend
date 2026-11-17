import { useEffect, useState, type FormEvent } from 'react'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api/todos'
import type { Todo } from './types/todo'
import './App.css'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const data = await fetchTodos()
        if (!cancelled) setTodos(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '할일을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const next = title.trim()
    if (!next || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      const todo = await createTodo(next)
      setTodos((prev) => [todo, ...prev])
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '할일 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo._id)
    setEditingTitle(todo.title)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  async function handleUpdate(id: string) {
    const next = editingTitle.trim()
    if (!next || busyId) return

    setBusyId(id)
    setError(null)
    try {
      const updated = await updateTodo(id, next)
      setTodos((prev) => prev.map((todo) => (todo._id === id ? updated : todo)))
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : '할일 수정에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    if (busyId) return

    setBusyId(id)
    setError(null)
    try {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo._id !== id))
      if (editingId === id) cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : '할일 삭제에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <main className="shell">
        <header className="header">
          <p className="brand">Focus List</p>
          <h1>오늘 할 일</h1>
          <p className="lede">추가하고, 고치고, 지워서 목록을 가볍게 유지하세요.</p>
        </header>

        <form className="composer" onSubmit={handleAdd}>
          <label className="sr-only" htmlFor="todo-title">
            새 할일
          </label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            autoComplete="off"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? '추가 중…' : '추가'}
          </button>
        </form>

        {error && <p className="status status-error" role="alert">{error}</p>}
        {loading && <p className="status">불러오는 중…</p>}

        {!loading && todos.length === 0 && (
          <p className="empty">아직 할 일이 없습니다. 위에서 하나 추가해 보세요.</p>
        )}

        <ul className="todo-list">
          {todos.map((todo) => {
            const isEditing = editingId === todo._id
            const isBusy = busyId === todo._id

            return (
              <li key={todo._id} className="todo-item">
                {isEditing ? (
                  <form
                    className="edit-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleUpdate(todo._id)
                    }}
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                      disabled={isBusy}
                    />
                    <div className="actions">
                      <button type="submit" disabled={isBusy || !editingTitle.trim()}>
                        저장
                      </button>
                      <button type="button" className="ghost" onClick={cancelEdit} disabled={isBusy}>
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="view-row">
                    <p className="todo-title">{todo.title}</p>
                    <div className="actions">
                      <button type="button" className="ghost" onClick={() => startEdit(todo)} disabled={isBusy}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => void handleDelete(todo._id)}
                        disabled={isBusy}
                      >
                        {isBusy ? '삭제 중…' : '삭제'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}

export default App
