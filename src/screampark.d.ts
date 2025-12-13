interface SCP extends GameGui<SCP_Gamedatas> {
  managers: Managers;
  stocks: Stocks;
  isLoadingLogsComplete: boolean;
  _registeredCustomTooltips: Record<string, string>;
  _attachedTooltips: Record<string, string>;
}

interface SCP_Player extends Player {}

interface SCP_Gamedatas extends Gamedatas<SCP_Player> {
  VIPS: Record<number, VIP>;
  vipCards: VipCard[];
  GENRES: Record<number, GENRE>;
  SCENES: Record<number, SCENE>;
  sceneDeckCount: number;
  ABILITIES: Record<number, string>;
  THEMES: Record<number, THEME>;
  themeHands: ThemeCard[];
  themeCards: ThemeCard[];
  sceneHand: SceneCard[];
  scenePublic: SceneCard[];
  sceneBoard: SceneCard[];
  completedScenes: number[];
  vipFulfillingScenes: number[];
  staffCounts: Record<number, number>;
  staffCountPrivate: number;
  abilityCounts: Record<number, number>;
  oppAbilityCount: number;
  day: number;
  nextPlayers: Record<number, number>;
  prevPlayers: Record<number, number>;
  isSolo: boolean;
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
  counters: Counters;
  vips?: BgaCards.Manager<VipCard>;
  scenes?: BgaCards.Manager<SceneCard>;
  themes?: BgaCards.Manager<ThemeCard>;
  stars?: BgaCards.Manager<StarCard>;
  meeples?: BgaCards.Manager<MeepleCard>;
}

interface Stocks {
  vips?: VipStocks;
  scenes?: SceneStocks;
  themes?: ThemeStocks;
  stars?: StarStocks;
  meeples?: MeepleStocks;
}

interface Counters {
  player: {
    staff?: Record<number, Counter>;
    candelabra?: Record<number, Counter>;
    lightbulb?: Record<number, Counter>;
    audio?: Record<number, Counter>;
    skull?: Record<number, Counter>;
  };
  table: { ability?: Counter };
}

type SCP_Card = {
  id: number;
  type?: string;
  type_arg?: number;
  location?: string;
  location_arg?: number;
};

type ActionName =
  | "actChooseTheme"
  | "actUndoChooseTheme"
  | "actPlaceScene"
  | "actAttachSceneStart"
  | "actAttachScene"
  | "actAttachSceneCancel"
  | "actDiscardScene"
  | "actAttachGenreStart"
  | "actAttachGenre"
  | "actAttachGenreCancel"
  | "actPlaceAnywhereStart"
  | "actPlaceAnywhere"
  | "actPlaceAnywhereCancel";
