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
    const { managers, stocks, gamedatas } = this.game;
    const { animations } = managers;
    const { players } = gamedatas;

    managers.stars = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_star",
      cardHeight: 40,
      cardWidth: 40,
      setupDiv: ({ id: playerId }, element) => {
        element.classList.add("scp_card");

        const colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
        const { color: playerColor } = players[playerId];

        const colorId = colors.indexOf(playerColor) + 1;
        element.style.backgroundImage = `url(${g_gamethemeurl}img/icons/star_${colorId}.png)`;

        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(_("${player_name}'s star"), {
            player_name: this.game.getFormattedPlayerName(playerId),
          }),
          ""
        );
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

    keysToNumbers(players).forEach((playerId) => {
      const { score } = players[playerId];
      board[score].addCard({ id: playerId });
    });
  }

  public set(playerId: number, score: number): void {
    const { board } = this.stocks;
    board[score].addCard({ id: playerId });
  }
}

interface StarCard {
  id: number;
}

interface StarStocks {
  board: Record<number, BgaCards.CardStock<StarCard>>;
}
