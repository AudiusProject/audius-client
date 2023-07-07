/**
 * Gets the scroll parent of an HTML element
 * From SO: https://stackoverflow.com/a/42543908/11435157
 * @param node
 * @returns the scroll parent
 */
export const getScrollParent = (node: HTMLElement): Element | null => {
  const regex = /(auto|scroll)/
  const parents = (_node: HTMLElement, ps: HTMLElement[]): HTMLElement[] => {
    if (_node.parentNode === null) {
      return ps
    }
    return parents(_node.parentNode as HTMLElement, ps.concat([_node]))
  }

  const style = (_node: HTMLElement, prop: string) =>
    getComputedStyle(_node, null).getPropertyValue(prop)
  const overflow = (_node: HTMLElement) =>
    style(_node, 'overflow') +
    style(_node, 'overflow-y') +
    style(_node, 'overflow-x')
  const scroll = (_node: HTMLElement) => regex.test(overflow(_node))

  const scrollParent = (_node: HTMLElement) => {
    if (!_node.parentNode) {
      return null
    }

    const ps = parents(_node.parentNode as HTMLElement, [])

    for (let i = 0; i < ps.length; i += 1) {
      if (scroll(ps[i])) {
        return ps[i]
      }
    }

    return document.scrollingElement || document.documentElement
  }

  return scrollParent(node)
}
