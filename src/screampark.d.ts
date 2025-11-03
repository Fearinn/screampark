interface SCP extends GameGui<SCP_Gamedatas> {
  managers: Managers;
  Stocks: Stocks;
}

interface SCP_Player extends Player {}

interface SCP_Gamedatas extends Gamedatas<SCP_Player> {}

interface Managers {}

interface Stocks {}

type ActionName = "";
