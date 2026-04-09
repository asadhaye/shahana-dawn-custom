# Bolt's Journal

2026-04-09 - Mousemove + rect bottleneck
Learning: Recomputing canvas.getBoundingClientRect() on every mousemove caused layout spikes under heavy pointer movement.
Action: Always cache canvas bounds and refresh on resize/room layout changes instead of per event.
