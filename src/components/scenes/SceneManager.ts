class SceneManager {
  private readonly game: SCP;
  public stocks: SceneStocks;
  private manager: BgaCards.Manager<SceneCard>;
  private readonly GENRES: Record<number, GENRE>;
  private readonly SCENES: Record<number, SCENE>;

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
      selectedSlotStyle: {
        outlineSize: 5,
      },
      selectableSlotStyle: {
        outlineSize: 5,
      },
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

          const { label: genreLabel } = this.GENRES[scene_id];
          this.game.addTooltipHtml(
            element.id,
            `<div class="scp_tooltip"> 
            ${this.game.format_string_recursive(_("${genreLabel}"), {
              genreLabel,
            })}
            </div>`
          );
          return;
        }

        element.style.backgroundImage = `url(${g_gamethemeurl}img/scenes/scene_${scene_id}.jpg)`;
        const { UP, DOWN } = this.SCENES[scene_id];

        this.game.addTooltipHtml(
          element.id,
          `<div class="scp_tooltip">
          ${this.game.format_string_recursive(_("${upLabel} / ${downLabel}"), {
            upLabel: _(UP.label),
            downLabel: _(DOWN.label),
          })}
          </div>`
        );
      },
      setupBackDiv: ({ type }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/${type}s/${type}_0.jpg)`;
      },
    });
    this.manager = this.game.managers.scenes;

    const { players, sceneDeckCount } = gamedatas;

    const boards = {};
    const fakeHands = {};
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
            const locations: SceneCard["location"][] = [
              "board",
              "placed",
              "placedAnywhere",
            ];
            return (
              locations.includes(location) && Number(location_arg) === playerId
            );
          },
        }
      );

      fakeHands[playerId] = new BgaCards.VoidStock(
        this.manager,
        document.getElementById(`scp_fakeHand-${playerId}`),
        {}
      );
    });

    this.game.stocks.scenes = {
      boards,
      fakeHands,
      hand: new BgaCards.LineStock(
        this.manager,
        document.getElementById("scp_hand"),
        {
          wrap: "nowrap",
          gap: "16px",
          sort: (a, b) => {
            const SCENE = this.SCENES[a.type_arg];
            const SCENE2 = this.SCENES[b.type_arg];
            return SCENE.UP.points - SCENE2.UP.points;
          },
          autoPlace: ({ location, location_arg }) => {
            return (
              (location === "hand" || location === "todiscard") &&
              Number(location_arg) === player_id
            );
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
    const { scenePublic, sceneHand, sceneBoard, completedScenes } =
      this.game.gamedatas;

    sceneBoard.sort((a, b) => {
      return Number(a.position) - Number(b.position);
    });
    scenePublic.sort((a, b) => {
      return Number(a.position) - Number(b.position);
    });
    this.manager.placeCards([...scenePublic, ...sceneHand, ...sceneBoard]);

    completedScenes.forEach((cardId) => {
      const cardElement = this.manager.getCardElement({
        id: cardId,
        type: "scene",
      });
      cardElement.classList.add("scp_scene-completed");
    });
  }

  public highlight(cards: SceneCard[]): void {
    cards.forEach((card) => {
      const cardElement = this.manager.getCardElement(card);
      cardElement.classList.add("scp_card-highlight");
    });
  }

  public clearHighlight(): void {
    document.querySelectorAll(".scp_card-highlight").forEach((cardElement) => {
      cardElement.classList.remove("scp_card-highlight");
    });
  }
}

interface SCENE {
  id: number;
  UP: {
    label: string;
    points: number;
    genreCost: Record<number, number>;
  };
  DOWN: {
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
  fakeHands: Record<number, BgaCards.VoidStock<SceneCard>>;
}

interface SceneCard extends SCP_Card {
  type: "scene" | "genre";
  location?: "hand" | "todiscard" | "board" | "placed" | "placedAnywhere";
  slot?: number;
  position?: number;
}

interface GENRE {
  id: number;
  label: string;
}
