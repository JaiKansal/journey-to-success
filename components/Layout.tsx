import React, { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main>
      <nav>
        {/* Add your navigation here */}
      </nav>
      {children}
      <footer>
        {/* Add your footer here */}
      </footer>
    </main>
  )
}

export default Layout 