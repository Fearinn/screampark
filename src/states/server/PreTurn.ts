class PreTurn extends State {
  private sceneManager: SceneManager;

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
  }

  public onUpdate(args: ArgsPreTurn): void {
    super.onUpdate(args);

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    super.onLeaving();

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("none");
  }
}

interface ArgsPreTurn {}
