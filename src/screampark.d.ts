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
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
  vips?: BgaCards.Manager<VipCard>;
  scenes?: BgaCards.Manager<SceneCard>;
  themes?: BgaCards.Manager<ThemeCard>;
}

interface Stocks {
  vips?: VipStocks;
  scenes?: SceneStocks;
  themes?: ThemeStocks;
}

type ActionName = "";

type SCP_Card = {
  id: number;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
};
