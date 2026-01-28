/**
 * Pre-configured sensors for session planner drag-and-drop
 *
 * Optimized for both desktop mouse and iPad touch interactions.
 * Uses separate MouseSensor + TouchSensor (not PointerSensor) for better control.
 */

import { useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'

export function useSessionSensors() {
  // Mouse sensor: requires 10px drag distance to prevent accidental drags on clicks
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  // Touch sensor: requires 250ms hold before drag starts (iPad-friendly)
  // Tolerance of 5px allows slight finger movement during hold
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })

  return useSensors(mouseSensor, touchSensor)
}
