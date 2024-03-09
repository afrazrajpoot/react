import React from 'react'
import BoardIdPage from './app/board/[boardId]/BoardIdPage'
import DashboardPage from './app/(dashboard)/DashboardPage'
import './main.css'
const App = () => {
  return (
    <>
    <DashboardPage searchParams={{
        search: undefined,
        favorites: undefined
      }} />
     {/* <h1 className="text-3xl font-bold underline">hy</h1> */}
    </>
  )
}

export default App
