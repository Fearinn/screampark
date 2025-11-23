class AttachScene extends State {
  private sceneManager: SceneManager;
  private SCENES: SCENE[];

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(): void {
    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { player_id: playerId } = this.game;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];

    board.setSlotSelectionMode("single");
    board.onSlotSelectionChange = (selection, slot) => {
      this.game.removeConfirmation();

      if (selection.length === 0) {
        return;
      }

      this.game.addConfirmation(_("confirm"), () => {
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
    const { player_id: playerId } = this.game;

    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];
    board.setSlotSelectionMode("none");
  }
}
