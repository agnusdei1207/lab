const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

function revealPage() {
  if (reducedMotion.matches) return

  const elements = document.querySelectorAll<HTMLElement>(
    "article > *, .page-header, .right.sidebar > *, .explorer",
  )

  elements.forEach((element, index) => {
    element.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 360,
        delay: Math.min(index * 28, 196),
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    )
  })
}

document.addEventListener("nav", revealPage)

document.addEventListener("click", (event) => {
  if (reducedMotion.matches || !(event.target instanceof Element)) return
  if (!event.target.closest(".darkmode, .search-button, .global-graph-icon")) return

  document.documentElement.animate([{ opacity: 0.88 }, { opacity: 1 }], {
    duration: 180,
    easing: "ease-out",
  })
})
