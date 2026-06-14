import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from './components/app/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { SystemParametersPage } from './pages/SystemParametersPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: HomePage,
})

const systemParametersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/system-parameters',
  component: SystemParametersPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([indexRoute, systemParametersRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
