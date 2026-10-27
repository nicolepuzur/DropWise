import { SidebarBody } from './SidebarBody'

/** The fixed navigation panel on the right edge of the screen (large screens; small ones use the header's drawer). */
export function Sidebar() {
  return (
    <aside className="fixed bottom-3 right-3 top-3 z-40 hidden w-60 rounded-3xl border border-line bg-[rgba(6,18,48,0.72)] p-3 backdrop-blur-xl lg:block">
      <SidebarBody />
    </aside>
  )
}
