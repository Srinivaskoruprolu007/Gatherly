import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { type AnyRouteMatch, Link, useMatches } from '@tanstack/react-router'
import { Fragment } from 'react'

type ResolvedCrumb = { label: string; path: string }

function resolveCrumbs(matches: AnyRouteMatch[]): ResolvedCrumb[] {
  return matches.flatMap((match) => {
    const breadcrumb = match.staticData?.breadcrumb
    if (!breadcrumb) return []

    const value =
      typeof breadcrumb === 'function' ? breadcrumb(match) : breadcrumb
    const labels = Array.isArray(value) ? value : [value]

    return labels.map((label) => ({ label, path: match.pathname }))
  })
}

export function AppBreadcrumb() {
  const matches = useMatches()

  // Don't render while any route is still loading
  if (matches.some((m) => m.status === 'pending')) return null

  const crumbs = resolveCrumbs(matches)
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <Fragment key={`${crumb.path}-${i}`}>
              <BreadcrumbItem className="hidden md:block">
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
