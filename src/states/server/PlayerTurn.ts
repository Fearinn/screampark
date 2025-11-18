class PlayerTurn extends State {
  private sceneManager: SceneManager;
  private SCENES: SCENE[];

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(args: ArgsPlayerTurn): void {
    const { player_id: playerId } = this.game;

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("multiple");

    hand.onSelectionChange = (selection, card) => {
      document.getElementById("generalactions").innerHTML = "";

      if (selection.length !== 1) {
        return;
      }

      const { id: cardId } = card;

      this.game.addButton(_("play as new Scene"), () => {
        this.game.performAction("actPlayScene", {
          cardId: cardId,
        });
      });
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    const { player_id: playerId } = this.game;
  }
}

interface ArgsPlayerTurn {
  _private: {
    playableScenes: SceneCard[];
  };
}
