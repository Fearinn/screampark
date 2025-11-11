class SceneManager {
  private readonly game: SCP;
  private stocks: SceneStocks;
  private manager: BgaCards.Manager<SCP_Card>;
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
    const { managers } = this.game;
    const { animations } = managers;

    this.game.managers.scenes = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_scene",
      cardHeight: 285,
      cardWidth: 150,
      cardBorderRadius: "8px",
      setupDiv: ({ type_arg: scene_id }, element) => {
        element.classList.add("scp_card");

        if (!scene_id) {
          return;
        }

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
      setupFrontDiv: ({ type_arg: scene_id }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/scenes/scene_${scene_id}.jpg)`;
      },
      setupBackDiv: ({ type_arg: scene_id }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/scenes/scene_0.jpg)`;
      },
    });
    this.manager = this.game.managers.vips;

    this.game.stocks.scenes = {
      deck: new BgaCards.Deck(
        managers.scenes,
        document.getElementById("scp_sceneDeck"),
        {}
      ),
    };
    this.stocks = this.game.stocks.scenes;
  }

  public setup(): void {
    this.build();
    const { deck } = this.stocks;
    const { sceneDeckCount } = this.game.gamedatas;
    deck.setCardNumber(sceneDeckCount);
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
  deck: BgaCards.Deck<SCP_Card>;
}
