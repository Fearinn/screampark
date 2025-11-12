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
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
  vips?: BgaCards.Manager<SCP_Card>;
  scenes?: BgaCards.Manager<SceneCard>;
}

interface Stocks {
  vips?: VipStocks;
  scenes?: SceneStocks;
}

type ActionName = "";

type SCP_Card = {
  id: number;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
};
