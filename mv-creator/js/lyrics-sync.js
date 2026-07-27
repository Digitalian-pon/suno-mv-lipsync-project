// Two pieces of pure logic, no UI:
//  1) TapSync - lets a user manually mark when each pasted lyric line starts
//     by tapping in time with playback (fallback/complement to AI transcription,
//     free and typically more accurate for sung vocals).
//  2) segmentIntoScenes - groups timestamped lyric lines into MV "scenes".

export class TapSync {
  constructor(lines, playbackController) {
    this.lines = lines.map((text) => ({ text, start: null, end: null }));
    this.playback = playbackController;
    this.cursor = 0;
  }

  get isDone() {
    return this.cursor >= this.lines.length;
  }

  get currentLine() {
    return this.lines[this.cursor];
  }

  // Call when the user marks the current playback moment as the start of
  // the current line.
  mark() {
    if (this.isDone) return null;
    const t = this.playback.getCurrentTime();
    this.lines[this.cursor].start = t;
    if (this.cursor > 0) {
      this.lines[this.cursor - 1].end = t;
    }
    this.cursor += 1;
    return t;
  }

  // Finalize end times once marking is complete (or audio ends).
  // Marking is sequential, so only a trailing run of lines can be unmarked
  // (the user stopped early or the song ended). Those share the remaining
  // time evenly so they still appear in the video instead of collapsing to
  // zero-length lines.
  finalize(totalDuration) {
    const firstUnmarked = this.lines.findIndex((l) => l.start == null);

    if (firstUnmarked !== -1) {
      const remainingStart = firstUnmarked === 0
        ? 0
        : this.lines[firstUnmarked - 1].start;
      const count = this.lines.length - firstUnmarked;
      const slice = Math.max(0, totalDuration - remainingStart) / (count + 1);
      for (let i = firstUnmarked; i < this.lines.length; i++) {
        this.lines[i].start = remainingStart + slice * (i - firstUnmarked + 1);
      }
    }

    for (let i = 0; i < this.lines.length; i++) {
      const next = this.lines[i + 1];
      this.lines[i].end = next ? next.start : totalDuration;
    }
    return this.lines;
  }
}

/**
 * Groups timestamped lines into scenes. A new scene starts whenever the max
 * line count is reached, or there is a pause longer than `minGapForNewScene`
 * seconds between two lines.
 * @param {Array<{text:string,start:number,end:number}>} lines
 */
export function segmentIntoScenes(lines, { maxLinesPerScene = 4, minGapForNewScene = 2.5 } = {}) {
  if (!lines.length) return [];
  const scenes = [];
  let current = [];

  const pushScene = () => {
    if (!current.length) return;
    scenes.push({
      lines: current,
      start: current[0].start,
      end: current[current.length - 1].end,
      background: { type: 'gradient', image: null },
    });
    current = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (current.length >= maxLinesPerScene) pushScene();
    if (current.length > 0) {
      const gap = line.start - current[current.length - 1].end;
      if (gap > minGapForNewScene) pushScene();
    }
    current.push(line);
  }
  pushScene();

  scenes.forEach((s, i) => { s.index = i; });
  return scenes;
}
