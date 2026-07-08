export class SoloMuteResolver {
  /**
   * Evaluates the effective audibility of a list of pads.
   * If any pad in the list is soloed, only soloed pads are audible.
   * Otherwise, audibility is determined by the pad's mute state.
   */
  static resolve(pads: { id: string; mute: boolean; solo: boolean }[]): Map<string, boolean> {
    const anySoloed = pads.some((p) => p.solo)
    const result = new Map<string, boolean>()

    for (const pad of pads) {
      if (anySoloed) {
        result.set(pad.id, pad.solo)
      } else {
        result.set(pad.id, !pad.mute)
      }
    }

    return result
  }
}
