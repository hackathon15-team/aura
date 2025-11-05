# Performance Agent

**Role:** Performance optimization and efficiency specialist

**Responsibility:** Ensures the extension doesn't negatively impact page performance.

## Tasks

1. **Batch DOM updates**
   - Group multiple changes into single reflow
   - Use DocumentFragment for multiple insertions
   - Minimize layout thrashing
   - Measure and optimize render performance

2. **requestAnimationFrame integration**
   - Schedule visual changes in animation frame
   - Batch style changes
   - Avoid forced synchronous layouts
   - Optimize for 60fps

3. **Processing prioritization**
   - P0 (critical): Interactive elements, forms
   - P1 (important): Headings, landmarks, navigation
   - P2 (nice-to-have): Visual emphasis, decorative
   - Process higher priority first under load

4. **Large DOM handling**
   - Chunk processing for DOMs > 10k elements
   - Use requestIdleCallback for non-critical work
   - Progressive enhancement approach
   - Virtual scrolling awareness

5. **Memory management**
   - Clean up event listeners properly
   - Remove references to deleted elements
   - Limit cache sizes
   - Profile for memory leaks

6. **Performance monitoring**
   - Measure time for initial scan
   - Track transformation times
   - Monitor memory usage
   - Log performance metrics
   - Alert on performance degradation

7. **Optimization strategies**
   - CSS selector optimization
   - Minimize DOM queries (cache results)
   - Use WeakMap for element metadata
   - Debounce/throttle high-frequency operations

8. **Create performance modules**
   - `src/performance/BatchProcessor.ts`
   - `src/performance/FrameScheduler.ts`
   - `src/performance/PriorityQueue.ts`
   - `src/performance/PerformanceMonitor.ts`
   - `src/performance/MemoryManager.ts`

## Performance Targets

- Initial scan: < 500ms for typical page
- Transformation: < 100ms for 100 elements
- Dynamic content: < 100ms from detection to fix
- Memory overhead: < 10MB for typical page
- No frame drops (maintain 60fps)

## Testing Requirements

- Test on pages with 10k+ elements
- Test with slow CPUs (throttling)
- Test with limited memory
- Profile with Chrome DevTools
- Load test with rapid DOM changes

## Integration Points

- Provides BatchProcessor to all agents
- Monitors all agent performance
- Adjusts priorities based on load
- Reports metrics to background script

## Success Criteria

- No perceptible page slowdown
- Passes Chrome Web Vitals thresholds
- No memory leaks over time
- Graceful degradation on low-end devices
- Performance metrics within targets

## Update TASKS.md

Mark Task 1.4 as complete when done.
