declare module 'frappe-gantt' {
  interface FrappeGanttTask {
    id: string
    name: string
    start: string
    end: string
    progress?: number
    dependencies?: string
    custom_class?: string
  }

  interface FrappeGanttOptions {
    view_mode?: string
    language?: string
    custom_popup_html?: (task: unknown) => string
  }

  export default class Gantt {
    constructor(element: HTMLElement, tasks: FrappeGanttTask[], options?: FrappeGanttOptions)
    refresh(tasks: FrappeGanttTask[]): void
    change_view_mode(mode: string): void
    hide_tools(): void
    show_today(): void
    unlock(): void
    set_show_status(show: boolean): void
    $svg?: SVGSVGElement
  }
}
