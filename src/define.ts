define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  getLibUrl("bga-animations", "1.x"),
  getLibUrl("bga-cards", "1.x"),
  getLibUrl("bga-score-sheet", "1.x"),
], function (
  dojo,
  declare,
  counter,
  gamegui,
  BgaAnimations,
  BgaCards,
  BgaScoreSheet
) {
  (window as any).BgaAnimations = BgaAnimations;
  (window as any).BgaCards = BgaCards;
  (window as any).BgaScoreSheet = BgaScoreSheet;

  return declare("bgagame.screampark", ebg.core.gamegui, new SCP());
});
