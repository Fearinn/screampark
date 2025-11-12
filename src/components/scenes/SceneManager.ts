class SceneManager {
  private readonly game: SCP;
  private stocks: SceneStocks;
  private manager: BgaCards.Manager<SceneCard>;
  private readonly GENRES: GENRE[];
  private readonly SCENES: SCENE[];

  constructor(game: SCP) {
    this.game = game;

    const { managers, stocks, gamedatas } = this.game;
    this.manager = managers.scenes;
    this.stocks = stocks.scenes;
    this.GENRES = gamedatas.GENRES;
    this.SCENES = gamedatas.SCENES;
  }

  private build(): void {
    const { managers, gamedatas } = this.game;
    const { animations } = managers;

    managers.scenes = new BgaCards.Manager<SceneCard>({
      animationManager: animations,
      type: "scp_scene",
      cardHeight: 285,
      cardWidth: 150,
      cardBorderRadius: "8px",
      setupDiv: ({ type }, element) => {
        element.classList.add("scp_card");

        if (type === "genre") {
          element.classList.add("scp_genre");
        }
      },
      setupFrontDiv: ({ type, type_arg: scene_id }, element) => {
        if (type === "genre") {
          element.style.backgroundImage = `url(${g_gamethemeurl}img/genres/genre_${scene_id}.jpg)`;

          const { label: genre_label } = this.GENRES[scene_id];
          this.game.addTooltip(
            element.id,
            this.game.format_string_recursive(_("${genre_label}"), {
              genre_label,
            }),
            ""
          );
          return;
        }

        if (!scene_id) {
          return;
        }

        element.style.backgroundImage = `url(${g_gamethemeurl}img/scenes/scene_${scene_id}.jpg)`;
        const { up, down } = this.SCENES[scene_id];

        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(_("${up_label} / ${down_label}"), {
            up_label: _(up.label),
            down_label: _(down.label),
          }),
          ""
        );
      },
      setupBackDiv: (card, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/scenes/scene_0.jpg)`;
      },
    });
    this.manager = this.game.managers.scenes;

    const { sceneDeckCount } = gamedatas;

    this.game.stocks.scenes = {
      deck: new BgaCards.Deck(
        this.manager,
        document.getElementById("scp_sceneDeck"),
        {
          cardNumber: sceneDeckCount,
        }
      ),
      genres: new BgaCards.Deck(
        this.manager,
        document.getElementById("scp_genreDeck"),
        {}
      ),
    };
    this.stocks = this.game.stocks.scenes;
  }

  public setup(): void {
    this.build();
    const { deck, genres } = this.stocks;

    Object.keys(this.GENRES).forEach((genre_id) => {
      genres.addCard({
        id: Number(genre_id),
        type: "genre",
        type_arg: Number(genre_id),
        location: "deck",
        location_arg: Math.floor(Math.random() * 5) + 1,
      });
    });
  }
}

interface SCENE {
  id: number;
  up: {
    label: string;
    points: number;
    genreCost: Record<number, number>;
  };
  down: {
    label: string;
    scenic: number;
    ability: number;
    staffCost: number;
    genres: Record<number, number>;
  };
}

interface SceneStocks {
  deck: BgaCards.Deck<SceneCard>;
  genres: BgaCards.Deck<SceneCard>;
}

interface SceneCard extends SCP_Card {
  type: "scene" | "genre";
}

interface GENRE {
  id: number;
  label: string;
}
