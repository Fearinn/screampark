class PlaceAnywhere extends State {
  private sceneManager: SceneManager;
  private SCENES: Record<number, SCENE>;

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(args: ArgsPlaceAnywhere): void {
    super.onUpdate(args);

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    this.game.addButton(
      _("cancel"),
      () => {
        this.game.performAction("actPlaceAnywhereCancel");
      },
      { type: "alert" }
    );

    const { cardToPlace, selectableSlots } = args;
    this.sceneManager.highlight([cardToPlace]);

    const { player_id: playerId } = this.game;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];

    board.setSlotSelectionMode("single", selectableSlots);
    board.onSlotSelectionChange = (selection, slot) => {
      this.game.clearButtons(true);

      if (selection.length === 0) {
        return;
      }
      const card = board.getCards().find((card) => {
        return (
          card.slot == slot &&
          card.position == 1 &&
          card.location_arg == playerId
        );
      });

      const { type_arg: sceneId } = card;
      const { UP } = this.SCENES[sceneId];

      this.game.addButton(
        this.game.format_string_recursive(_("place to left of ${sceneLabel}"), {
          sceneLabel: _(UP.label),
        }),
        () => {
          this.game.performAction("actPlaceAnywhere", {
            slot,
          });
        }
      );
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    super.onLeaving();

    this.sceneManager.clearHighlight();

    const { player_id: playerId } = this.game;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];
    board.setSlotSelectionMode("none");
  }
}

interface ArgsPlaceAnywhere {
  cardToPlace: SceneCard;
  selectableSlots: number[];
}
