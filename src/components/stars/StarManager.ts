class StarManager {
  private readonly game: SCP;
  private stocks: StarStocks;
  private manager: BgaCards.Manager<StarCard>;

  constructor(game: SCP) {
    this.game = game;
    const { managers, stocks } = this.game;
    this.manager = managers.stars;
    this.stocks = stocks.stars;
  }

  private build(): void {
    const { managers, stocks } = this.game;
    const { animations } = managers;

    managers.stars = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_star",
      cardHeight: 40,
      cardWidth: 40,
      setupDiv: ({ id }, element) => {
        element.classList.add("scp_card");
        element.style.backgroundImage = `url(${g_gamethemeurl}img/icons/star_${id}.png)`;
      },
    });
    this.manager = managers.stars;

    const board = {};
    for (let points = 0; points < 80; points++) {
      board[points] = new BgaCards.LineStock(
        this.manager,
        document.getElementById(`scp_stars-${points}`),
        {
          wrap: "nowrap",
          gap: "16px",
        }
      );
    }

    stocks.stars = { board };
    this.stocks = stocks.stars;
  }

  public setup(): void {
    this.build();
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;
    const { board } = this.stocks;

    keysToNumbers(players).forEach((player_id, index) => {
      const { score } = players[player_id];
      board[score].addCard({ id: index + 1 });
    });
  }
}

interface StarCard extends Partial<SCP_Card> {
  id: number;
  location: "board";
}

interface StarStocks {
  board: Record<number, BgaCards.CardStock<StarCard>>;
}
