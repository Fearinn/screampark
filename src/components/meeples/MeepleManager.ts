class MeepleManager {
  private readonly game: SCP;
  public stocks: MeepleStocks;
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
      setupDiv: ({ id: playerId }, element) => {
        element.classList.add("scp_card");

        const { color: playerColor } = players[playerId];
        const colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
        const colorId = colors.indexOf(playerColor) + 1;

        element.style.backgroundImage = `url(${g_gamethemeurl}img/icons/meeple_${colorId}.png)`;

        this.game.addTooltipHtml(
          element.id,
          `<span class="scp_tooltip">
          ${this.game.format_string_recursive(_("${player_name}'s meeple"), {
            player_name: this.game.getFormattedPlayerName(playerId),
          })}
          </span>`
        );
      },
    });
    this.manager = managers.meeples;

    const { players } = gamedatas;
    const tracks: MeepleStocks["tracks"] = {};
    keysToNumbers(players).forEach((playerId) => {
      tracks[playerId] = {};

      for (let slot = 0; slot <= 24; slot++) {
        tracks[playerId][slot] = new BgaCards.CardStock(
          this.manager,
          document.getElementById(`scp_meepleHouse-${playerId}`)
        );
      }
    });

    stocks.meeples = { tracks };
    this.stocks = stocks.meeples;
  }

  public setup(): void {
    this.build();
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;
    const { tracks } = this.stocks;

    keysToNumbers(players).forEach((playerId) => {
      const track = tracks[playerId];
      track[0].addCard({ id: playerId });
    });
  }
}

interface MeepleCard {
  id: number;
}

interface MeepleStocks {
  tracks: Record<number, Record<number, BgaCards.CardStock<MeepleCard>>>;
}
