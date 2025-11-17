interface SCP extends GameGui<SCP_Gamedatas> {
  managers: Managers;
  stocks: Stocks;
}

interface SCP_Player extends Player {}

interface SCP_Gamedatas extends Gamedatas<SCP_Player> {
  VIPS: VIP[];
  vipCards: VipCard[];
  GENRES: GENRE[];
  SCENES: SCENE[];
  sceneDeckCount: number;
  THEMES: THEME[];
  themeHands: ThemeCard[];
  themeCards: ThemeCard[];
  sceneHand: SceneCard[];
  sceneCards: SceneCard[];
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
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

type SCP_Card = {
  id: number;
  type?: string;
  type_arg?: number;
  location?: string;
  location_arg?: number;
};

type ActionName = "actChooseTheme" | "actUndoChooseTheme";
