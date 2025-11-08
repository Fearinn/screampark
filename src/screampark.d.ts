interface SCP extends GameGui<SCP_Gamedatas> {
  managers: Managers;
  stocks: Stocks;
}

interface SCP_Player extends Player {}

interface SCP_Gamedatas extends Gamedatas<SCP_Player> {
  VIPS: VIP[];
  vipCards: VipCard[];
  GENRES: GENRE[];
}

interface Managers {
  zoom: ZoomManager;
  animations: BgaAnimations.Manager;
  vips?: BgaCards.Manager<SCP_Card>;
  genres?: BgaCards.Manager<SCP_Card>;
}

interface Stocks {
  vips?: VipStocks;
  genres?: GenreStocks;
}

type ActionName = "";

type SCP_Card = {
  id: number;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
};
