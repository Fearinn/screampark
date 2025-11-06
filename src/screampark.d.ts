interface SCP extends GameGui<SCP_Gamedatas> {
  managers: Managers;
  stocks: Stocks;
}

interface SCP_Player extends Player {}

interface SCP_Gamedatas extends Gamedatas<SCP_Player> {
  VIPS: VIP[];
  vipCards: VipCard[];
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
  vips?: BgaCards.Manager<SCP_Card>;
}

interface Stocks {
  vips?: VipStocks;
}

type ActionName = "";

type SCP_Card = {
  id: string;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
};
