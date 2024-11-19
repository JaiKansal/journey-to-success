import StyledComponentsRegistry from './registry'
import './globals.css'

export const metadata = {
  title: 'Your Journey to Success',
  description: 'Track your progress and stay motivated',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
