# Phase 10: Session Planner Grid - Research

**Researched:** 2026-01-27
**Domain:** React drag-and-drop for grid-based session planning
**Confidence:** HIGH

## Summary

This phase requires implementing a 4x3 grid interface where coaches can arrange drills by dragging them from a library into grid cells. The grid has 4 rows (Activation, Dribbling, Passing, Shooting) and 3 columns. The implementation must support both desktop (mouse) and iPad (touch) interactions, plus an accessible click-to-place alternative.

The standard approach for React drag-and-drop in 2026 is **dnd-kit** - a modular, lightweight (~10kb), performant toolkit with built-in support for mouse, touch, pointer, and keyboard inputs. It is the most widely recommended library for React DnD, especially for touch-enabled applications. The project already has the database schema (`grid_data` JSONB field with `GridCell` and `GridData` types) ready for this feature.

**Primary recommendation:** Use @dnd-kit/core + @dnd-kit/sortable with separate MouseSensor and TouchSensor (not PointerSensor) for reliable iPad touch support. Implement click-to-place as custom state logic layered on top of dnd-kit.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop primitives | Zero dependencies, 10kb, built for React with hooks |
| @dnd-kit/sortable | ^10.0.0 | Sortable preset | Provides useSortable, SortableContext for list/grid layouts |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities | CSS.Transform helpers for smooth drag visuals |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/modifiers | ^9.0.0 | Movement constraints | Restrict drag to axis, snap to grid |
| @dnd-kit/accessibility | ^3.1.1 | Screen reader support | Custom announcements (optional) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dnd-kit | react-dnd | More complex, steeper learning curve, but supports native HTML5 DnD for desktop-to-browser drag |
| dnd-kit | hello-pangea/dnd | Simpler API but less customizable, fork of deprecated react-beautiful-dnd |
| dnd-kit | Pragmatic DnD | Framework-agnostic but has React 19 compatibility issues in some packages |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Note on React 19:** The project uses React 19. dnd-kit's peer dependencies specify `react >=16.8.0`. If npm 7+ throws peer dependency warnings, use `npm install --legacy-peer-deps` as a workaround. The library functionally works with React 19 despite outdated peer deps.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── sessions/
│       ├── SessionGrid.tsx        # Main 4x3 grid container with DndContext
│       ├── GridCell.tsx           # Individual droppable cell
│       ├── DrillCard.tsx          # Draggable drill item
│       ├── DrillLibrarySidebar.tsx # Source list of available drills
│       └── index.ts               # Barrel export
├── hooks/
│   └── useSessionGrid.ts          # Grid state management hook
├── types/
│   └── session-grid.ts            # GridData, GridCell types (extend existing)
└── pages/
    └── SessionPlannerPage.tsx     # Page composing grid + sidebar
```

### Pattern 1: DndContext + Separate Droppable Cells
**What:** Use a single DndContext wrapping both the drill library and the grid. Each grid cell is a `useDroppable` zone, and drills are `useDraggable` items.
**When to use:** When drills move FROM library TO grid (not sorting within grid)
**Example:**
```typescript
// Source: https://docs.dndkit.com
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

function SessionPlanner() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }, // 10px before drag starts
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Hold 250ms before drag starts
      tolerance: 5, // Allow 5px movement during delay
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Place drill (active.id) into cell (over.id)
      setGridData(prev => ({
        ...prev,
        cells: {
          ...prev.cells,
          [over.id]: { drillId: active.id as string }
        }
      }));
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <DrillLibrarySidebar drills={drills} />
      <SessionGrid gridData={gridData} />
    </DndContext>
  );
}
```

### Pattern 2: Click-to-Place State Machine
**What:** Implement click-to-place as a two-step interaction: (1) click drill to select, (2) click cell to place. Track "selectedDrillId" in state.
**When to use:** As alternative to drag-drop, especially useful on mobile/accessibility
**Example:**
```typescript
// Custom click-to-place logic (not dnd-kit)
const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);

function handleDrillClick(drillId: string) {
  setSelectedDrillId(prev => prev === drillId ? null : drillId); // Toggle selection
}

function handleCellClick(cellKey: string) {
  if (selectedDrillId) {
    setGridData(prev => ({
      ...prev,
      cells: { ...prev.cells, [cellKey]: { drillId: selectedDrillId } }
    }));
    setSelectedDrillId(null); // Clear selection after placement
  }
}
```

### Pattern 3: DragOverlay for Smooth Drag Visuals
**What:** Render a floating copy of the dragged item using DragOverlay, separate from the original.
**When to use:** Always, for polished drag experience without layout shifts
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/drag-overlay
import { DndContext, DragOverlay } from '@dnd-kit/core';

function SessionPlanner() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <DndContext
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={() => setActiveId(null)}
    >
      {/* ... grid and library ... */}
      <DragOverlay>
        {activeId ? <DrillCard drill={getDrillById(activeId)} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### Anti-Patterns to Avoid
- **Using PointerSensor with TouchSensor:** Invalid combination. Use EITHER PointerSensor alone OR MouseSensor + TouchSensor together.
- **Forgetting touch-action CSS:** Without `touch-action: manipulation` on draggables, touch drags conflict with scrolling.
- **Re-rendering entire grid on drag:** Only update the affected cell, use React.memo on GridCell components.
- **Storing full drill objects in grid_data:** Store only drillId references, fetch drill details separately.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Touch + Mouse support | Custom touch event handling | dnd-kit sensors | Edge cases with multi-touch, scroll conflicts, activation thresholds |
| Drag transforms | Manual CSS transforms | @dnd-kit/utilities CSS.Transform | Handles translate3d, scale, rotation consistently |
| Screen reader announcements | Custom aria-live regions | dnd-kit built-in accessibility | Pre-built announcements for drag start/end/over |
| Collision detection | Custom hit testing | dnd-kit collision algorithms | closestCenter, closestCorners handle edge cases |

**Key insight:** Drag-and-drop looks deceptively simple but involves complex edge cases around activation thresholds, touch vs. scroll disambiguation, accessibility, and transform calculations. dnd-kit handles these through tested sensors and utilities.

## Common Pitfalls

### Pitfall 1: PointerSensor on Touch Devices
**What goes wrong:** PointerSensor's touch-action: none conflicts with page scroll on mobile
**Why it happens:** Pointer events don't allow preventing scroll in event handlers (unlike touch events)
**How to avoid:** Use MouseSensor + TouchSensor together instead of PointerSensor for cross-device support
**Warning signs:** Users can't scroll the page after touching a draggable element

### Pitfall 2: Missing Activation Constraints
**What goes wrong:** Drag starts immediately on touch, preventing tap/click interactions
**Why it happens:** No delay or distance threshold configured
**How to avoid:** Configure `distance: 10` for mouse, `delay: 250, tolerance: 5` for touch
**Warning signs:** Users can't click/tap items to select them, accidental drags everywhere

### Pitfall 3: Transform Not Applied to DOM
**What goes wrong:** onDragEnd fires but dragged item doesn't visually move
**Why it happens:** dnd-kit provides transform values but doesn't apply them - you must apply CSS
**How to avoid:** Apply transform to element style: `transform: translate3d(${x}px, ${y}px, 0)`
**Warning signs:** All events fire correctly but no visual drag feedback

### Pitfall 4: Grid State Not Persisting
**What goes wrong:** Grid resets on page refresh
**Why it happens:** Only updating local state, not calling updateSession API
**How to avoid:** Debounce grid changes and save to Supabase via existing sessions service
**Warning signs:** Data lost on refresh, works during session but gone after

### Pitfall 5: Touch Scroll Conflicts
**What goes wrong:** Can't scroll drill library list on iPad
**Why it happens:** touch-action: none on entire container instead of just drag handles
**How to avoid:** Apply `touch-action: none` only to drag handle, use `touch-action: manipulation` on container
**Warning signs:** Page becomes unscrollable after first touch on any draggable

### Pitfall 6: Click Handler Collision with Drag Listeners
**What goes wrong:** onClick never fires because drag listeners intercept all pointer events
**Why it happens:** Drag listeners attached to same element as click handlers
**How to avoid:** Use activation constraints (distance/delay) so quick clicks complete before drag activates
**Warning signs:** Can drag but can't click to select or view details

## Code Examples

Verified patterns from official sources:

### Droppable Grid Cell
```typescript
// Source: https://docs.dndkit.com/api-documentation/droppable/usedroppable
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface GridCellProps {
  cellKey: string; // e.g., "activation-0", "dribbling-1"
  drillId: string | null;
  onRemove: (cellKey: string) => void;
  onClick: (cellKey: string) => void;
  isSelected: boolean;
}

export function GridCell({ cellKey, drillId, onRemove, onClick, isSelected }: GridCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: cellKey });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClick(cellKey)}
      className={cn(
        "min-h-24 border-2 border-dashed rounded-lg p-2",
        "transition-colors duration-150",
        isOver && "border-blue-500 bg-blue-50",
        isSelected && "ring-2 ring-blue-500",
        !drillId && "border-gray-300",
        drillId && "border-solid border-gray-400 bg-white"
      )}
    >
      {drillId ? (
        <div className="flex items-center justify-between">
          <span>{/* Drill name */}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(cellKey); }}
            className="min-h-11 min-w-11 p-2 text-gray-500 hover:text-red-500"
            aria-label="Remove drill from cell"
          >
            X
          </button>
        </div>
      ) : (
        <span className="text-gray-400">Drop drill here</span>
      )}
    </div>
  );
}
```

### Draggable Drill Card
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DrillCardProps {
  drill: Drill;
  isSelected: boolean;
  onClick: (drillId: string) => void;
}

export function DrillCard({ drill, isSelected, onClick }: DrillCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: drill.id,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 bg-white border rounded-lg shadow-sm cursor-grab",
        "touch-action-manipulation", // Allow scroll but enable drag
        isDragging && "opacity-50 cursor-grabbing",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={() => onClick(drill.id)}
      {...listeners}
      {...attributes}
    >
      <h4 className="font-medium">{drill.name}</h4>
      <p className="text-sm text-gray-500 capitalize">{drill.category}</p>
    </div>
  );
}
```

### Sensor Configuration for iPad + Desktop
```typescript
// Source: https://docs.dndkit.com/api-documentation/sensors/touch
import { useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useSessionSensors() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement before drag starts
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms press before drag starts
      tolerance: 5, // 5px movement allowed during delay
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}
```

### Grid Data Management Hook
```typescript
// Custom hook for managing grid state with persistence
import { useState, useCallback } from 'react';
import { useUpdateSession } from '@/hooks/useSessions';
import type { GridData, GridCell } from '@/lib/database.types';

const ROW_KEYS = ['activation', 'dribbling', 'passing', 'shooting'] as const;
const COL_COUNT = 3;

export function useSessionGrid(sessionId: string, initialData: GridData) {
  const [gridData, setGridData] = useState<GridData>(initialData);
  const updateSession = useUpdateSession();

  const placeDrill = useCallback((cellKey: string, drillId: string) => {
    setGridData(prev => {
      const updated = {
        ...prev,
        cells: { ...prev.cells, [cellKey]: { drillId } }
      };
      // Persist to backend
      updateSession.mutate({ id: sessionId, grid_data: updated });
      return updated;
    });
  }, [sessionId, updateSession]);

  const removeDrill = useCallback((cellKey: string) => {
    setGridData(prev => {
      const updated = {
        ...prev,
        cells: { ...prev.cells, [cellKey]: { drillId: null } }
      };
      updateSession.mutate({ id: sessionId, grid_data: updated });
      return updated;
    });
  }, [sessionId, updateSession]);

  return { gridData, placeDrill, removeDrill, ROW_KEYS, COL_COUNT };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | dnd-kit or hello-pangea/dnd | 2022 | react-beautiful-dnd deprecated, archived by Atlassian |
| HTML5 Drag API | Custom pointer/touch APIs | ~2020 | HTML5 DnD poor on touch devices, custom sensors preferred |
| Single PointerSensor | MouseSensor + TouchSensor | dnd-kit best practice | Better touch-action control, scroll disambiguation |
| Storing objects in grid | Storing IDs only | Always | Normalization, avoid data duplication |

**Deprecated/outdated:**
- react-beautiful-dnd: Archived in 2024, no React 19 support. Use hello-pangea/dnd (community fork) or migrate to dnd-kit
- @dnd-kit/react (v0.2.x): New experimental package, not yet stable. Stick with @dnd-kit/core + @dnd-kit/sortable for production

## Open Questions

Things that couldn't be fully resolved:

1. **dnd-kit React 19 Peer Dependency Warning**
   - What we know: Works functionally with React 19, but npm warns about peer deps
   - What's unclear: If/when official React 19 peer dep support will be added
   - Recommendation: Use `--legacy-peer-deps` flag during install, test thoroughly

2. **Optimal Touch Delay for iPad**
   - What we know: 250ms is documented default, works for most cases
   - What's unclear: Whether soccer coaches in field conditions prefer shorter/longer delay
   - Recommendation: Start with 250ms, test with real users, consider making configurable

3. **DragOverlay vs In-Place Transform**
   - What we know: DragOverlay renders outside document flow, cleaner visuals
   - What's unclear: Performance impact on iPad with many drills
   - Recommendation: Use DragOverlay by default, profile if performance issues arise

## Sources

### Primary (HIGH confidence)
- [dnd-kit Documentation](https://docs.dndkit.com) - API reference, sensors, patterns
- [dnd-kit GitHub](https://github.com/clauderic/dnd-kit) - Source code, issues, version info

### Secondary (MEDIUM confidence)
- [Top 5 Drag-and-Drop Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Ecosystem comparison
- [dnd-kit GitHub Issues on React 19](https://github.com/clauderic/dnd-kit/issues/1511) - Compatibility status

### Tertiary (LOW confidence)
- WebSearch results on touch sensor configuration - Community patterns, not officially verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - dnd-kit is clearly the standard, well-documented
- Architecture: HIGH - Patterns directly from official documentation
- Pitfalls: MEDIUM - Mix of official docs and community-reported issues

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - dnd-kit is stable, slow-moving)
