class MeepleManager {
  private readonly game: SCP;
  private stocks: MeepleStocks;
  private manager: BgaCards.Manager<MeepleCard>;

  constructor(game: SCP) {
    this.game = game;
    const { managers, stocks } = this.game;
    this.manager = managers.meeples;
    this.stocks = stocks.meeples;
  }

  private build(): void {
    const { managers, stocks, keysToNumbers, gamedatas } = this.game;
    const { animations } = managers;

    managers.meeples = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_meeple",
      cardHeight: 100,
      cardWidth: 100,
      setupDiv: ({ id: player_id, player_color }, element) => {
        element.classList.add("scp_card");
        const colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
        const color_id = colors.indexOf(player_color) + 1;
        element.style.backgroundImage = `url(${g_gamethemeurl}img/icons/meeple_${color_id}.png)`;

        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(_("${player_name}'s meeple"), {
            player_name: this.game.getFormattedPlayerName(player_id),
          }),
          ""
        );
      },
    });
    this.manager = managers.meeples;

    const { players } = gamedatas;
    const tracks = {};
    keysToNumbers(players).forEach((player_id) => {
      tracks[player_id] = {
        0: new BgaCards.LineStock(
          this.manager,
          document.getElementById(`scp_meepleStep-${0}-${player_id}`)
        ),
      };
    });

    stocks.meeples = { tracks };
    this.stocks = stocks.meeples;
  }

  public setup(): void {
    this.build();
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;
    const { tracks } = this.stocks;

    keysToNumbers(players).forEach((player_id) => {
      const { color: player_color } = players[player_id];
      tracks[player_id][0].addCard({ id: player_id, player_color });
    });
  }
}

interface MeepleCard {
  id: number;
  player_color: string;
}

interface MeepleStocks {
  tracks: Record<number, Record<number, BgaCards.CardStock<MeepleCard>>>;
}
