class ThemeManager {
  private readonly game: SCP;
  private stocks: ThemeStocks;
  private manager: BgaCards.Manager<ThemeCard>;
  private THEMES: THEME[];

  constructor(game: SCP) {
    this.game = game;
    this.manager = this.game.managers.themes;
    this.stocks = this.game.stocks.themes;
    this.THEMES = this.game.gamedatas.THEMES;
  }

  private build(): void {
    const { managers, stocks, gamedatas, keysToNumbers } = this.game;
    const { animations } = managers;

    managers.themes = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_theme",
      cardHeight: 286,
      cardWidth: 210,
      cardBorderRadius: "8px",
      setupDiv: ({ type_arg: theme_id }, element) => {
        element.classList.add("scp_card");
      },
      setupFrontDiv: ({ type_arg: theme_id }, element) => {
        if (!theme_id) {
          return;
        }
        element.style.backgroundImage = `url(${g_gamethemeurl}img/themes/theme_${theme_id}.jpg)`;

        const { label } = this.THEMES[theme_id];
        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(_("${theme_label}"), {
            theme_label: _(label),
          }),
          ""
        );
      },
      setupBackDiv: (card, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/themes/theme_0.jpg)`;
      },
    });
    this.manager = managers.themes;

    const { players } = gamedatas;
    const boards = {};
    keysToNumbers(players).forEach((player_id) => {
      boards[player_id] = new BgaCards.LineStock(
        this.manager,
        document.getElementById(`scp_themes-${player_id}`),
        {
          gap: "16px",
          autoPlace: ({ location, location_arg }) => {
            return (
              (location === "hand" || location === "board") &&
              location_arg == player_id
            );
          },
        }
      );
    });

    stocks.themes = {
      boards,
    };
    this.stocks = stocks.themes;
  }

  public setup(): void {
    this.build();
    const { themeHands, themeCards } = this.game.gamedatas;
    this.manager.placeCards([...themeHands, ...themeCards]);
  }
}

interface ThemeCard extends Partial<SCP_Card> {
  id: number;
  location: "board" | "hand";
  location_arg: number;
}

interface THEME {
  id: number;
  label: string;
  genres: Record<number, number>;
}

interface ThemeStocks {
  boards: Record<number, BgaCards.LineStock<ThemeCard>>;
}
