class ThemeManager {
  private readonly game: SCP;
  public stocks: ThemeStocks;
  private manager: BgaCards.Manager<ThemeCard>;
  private THEMES: THEME[];

  constructor(game: SCP) {
    this.game = game;
    const { managers, stocks, gamedatas } = this.game;
    this.manager = managers.themes;
    this.stocks = stocks.themes;
    this.THEMES = gamedatas.THEMES;
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
      isCardVisible: (card) => {
        return !!card.type_arg;
      },
      setupDiv: (card, element) => {
        element.classList.add("scp_card");
      },
      setupFrontDiv: ({ type_arg: theme_id }, element) => {
        if (!theme_id) {
          return;
        }

        element.style.backgroundImage = `url(${g_gamethemeurl}img/themes/theme_${theme_id}.jpg)`;

        const { label, genreCost } = this.THEMES[theme_id];
        this.game.addTooltipHtml(
          element.id,
          `<div class="scp_tooltip scp_themeTooltip">
            <h4 class="scp_title scp_tooltipTitle">${_(label)}</h4>
            <div class="scp_themeTooltipContent">
                <p>End of round/day:</p>
                <p class="scp_tooltipContent">
                ${this.game.format_string_recursive(
                  _("1 point for each scene with any ${genre_icon}"),
                  {
                    themeLabel: _(label),
                    genreId: genreCost[0],
                  }
                )}
                </p>
                <p class="scp_tooltipContent">
                ${this.game.format_string_recursive(
                  _("1 point for each scene with any ${genre_icon}"),
                  {
                    themeLabel: _(label),
                    genreId: genreCost[1],
                  }
                )}
                </p>
            </div>
          </div>`
        );
      },
      setupBackDiv: (card, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/themes/theme_0.jpg)`;
      },
    });
    this.manager = managers.themes;

    const { players } = gamedatas;
    const boards = {};
    keysToNumbers(players).forEach((playerId) => {
      boards[playerId] = new BgaCards.LineStock(
        this.manager,
        document.getElementById(`scp_themes-${playerId}`),
        {
          wrap: "nowrap",
          gap: "16px",
          autoPlace: ({ location, location_arg }) => {
            return (
              (location === "hand" || location === "board") &&
              location_arg == playerId
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
  location?: "board" | "hand";
  location_arg?: number;
}

interface THEME {
  id: number;
  label: string;
  genreCost: Record<number, number>;
}

interface ThemeStocks {
  boards: Record<number, BgaCards.LineStock<ThemeCard>>;
}
