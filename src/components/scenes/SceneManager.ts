class SceneManager {
  private readonly game: SCP;
  public stocks: SceneStocks;
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
    const { managers, gamedatas, keysToNumbers, player_id } = this.game;
    const { animations } = managers;

    managers.scenes = new BgaCards.Manager<SceneCard>({
      animationManager: animations,
      type: "scp_scene",
      cardHeight: 285.1,
      cardWidth: 150,
      cardBorderRadius: "8px",
      isCardVisible: ({ type_arg }) => {
        return !!type_arg;
      },
      setupDiv: ({ type }, element) => {
        element.classList.add("scp_card");

        if (type === "genre") {
          element.classList.add("scp_genre");
        }
      },
      setupFrontDiv: ({ type, type_arg: scene_id }, element) => {
        if (!(scene_id > 0)) {
          return;
        }

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
      setupBackDiv: ({ type }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/${type}s/${type}_0.jpg)`;
      },
    });
    this.manager = this.game.managers.scenes;

    const { players, sceneDeckCount } = gamedatas;

    const boards = {};
    keysToNumbers(players).forEach((playerId) => {
      boards[playerId] = new BgaCards.SlotStock(
        this.manager,
        document.getElementById(`scp_scenes-${playerId}`),
        {
          gap: "16px",
          wrap: "nowrap",
          slotsIds: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24,
          ],
          mapCardToSlot: ({ slot }) => {
            return Number(slot);
          },
          autoPlace: ({ location, location_arg }) => {
            return (
              (location === "board" || location === "played") &&
              Number(location_arg) === playerId
            );
          },
        }
      );
    });

    this.game.stocks.scenes = {
      boards,
      hand: new BgaCards.LineStock(
        this.manager,
        document.getElementById("scp_hand"),
        {
          gap: "16px",
          wrap: "nowrap",
          sort: (a, b) => {
            return (
              this.SCENES[a.type_arg].up.points -
              this.SCENES[b.type_arg].up.points
            );
          },
          autoPlace: ({ location, location_arg }) => {
            return location === "hand" && Number(location_arg) === player_id;
          },
        }
      ),
      deck: new BgaCards.Deck(
        this.manager,
        document.getElementById("scp_sceneDeck"),
        {
          cardNumber: sceneDeckCount,
          fakeCardGenerator: (deckId) => {
            const fakeCard = this.manager.getFakeCardGenerator()(deckId);
            fakeCard.type = "scene";
            return fakeCard;
          },
        }
      ),
      genreDeck: new BgaCards.Deck(
        this.manager,
        document.getElementById("scp_genreDeck"),
        {
          cardNumber: 20,
          fakeCardGenerator: (deckId) => {
            const fakeCard = this.manager.getFakeCardGenerator()(deckId);
            fakeCard.type = "genre";
            return fakeCard;
          },
        }
      ),
    };
    this.stocks = this.game.stocks.scenes;
  }

  public setup(): void {
    this.build();
    const { sceneCards, sceneHand, sceneBoard } = this.game.gamedatas;
    this.manager.placeCards([...sceneCards, ...sceneHand, ...sceneBoard]);
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
  genreDeck: BgaCards.Deck<SceneCard>;
  hand: BgaCards.LineStock<SceneCard>;
  boards: Record<number, BgaCards.SlotStock<SceneCard>>;
}

interface SceneCard extends SCP_Card {
  type: "scene" | "genre";
  location?: "hand" | "board" | "played";
  slot?: number;
  order?: number;
}

interface GENRE {
  id: number;
  label: string;
}
