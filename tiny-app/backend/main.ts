// tinyjs backend — full system access via txiki.js (the 'tjs' global).
// Every api method is callable from the page: await tiny.api.call('hello', {...})
export const api: Record<string, TinyApiHandler> = {
  hello: async ({ name }: { name: string }) => 'hi ' + name + ' — from the backend',
};

export function init(app: TinyApp) {
  // window is up; push events with app.push('event', data)
}
