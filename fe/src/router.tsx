import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { AppLayout } from './components/app/AppLayout'
import { HomePage } from './pages/HomePage'
import { SystemParametersPage } from './pages/SystemParametersPage'

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const systemParametersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/system-parameters',
  component: SystemParametersPage,
})

const routeTree = rootRoute.addChildren([indexRoute, systemParametersRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
