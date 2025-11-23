class AttachScene extends State {
  private sceneManager: SceneManager;
  private SCENES: SCENE[];

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(args: ArgsAttachScene): void {
    super.onUpdate(args);

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    this.game.addButton(
      _("cancel"),
      () => {
        this.game.performAction("actAttachSceneCancel");
      },
      { type: "alert" }
    );

    const { player_id: playerId } = this.game;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];

    board.setSlotSelectionMode("single");
    board.onSlotSelectionChange = (selection, slot) => {
      this.game.clearButtons();

      if (selection.length === 0) {
        return;
      }

      this.game.addButton(_("confirm"), () => {
        this.game.performAction("actAttachScene", {
          slot,
        });
      });
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    super.onLeaving();

    const { player_id: playerId } = this.game;

    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];
    board.setSlotSelectionMode("none");
  }
}

interface ArgsAttachScene {}
