class StateManager {
  protected readonly game: SCP;
  private readonly states: Record<StateName, State> | {};

  constructor(game: SCP) {
    this.game = game;
    this.states = {
      ChooseTheme: new ChooseTheme(this.game),
      PreTurn: new PreTurn(this.game),
      PlayerTurn: new PlayerTurn(this.game),
      AttachScene: new AttachScene(this.game),
      AttachGenre: new AttachGenre(this.game),
      PlaceAnywhere: new PlaceAnywhere(this.game),
    };
  }

  onEntering(stateName: StateName, args: Record<string, any>): void {
    const { isSpectator } = this.game;

    if (isSpectator) {
      return;
    }

    this.states[stateName]?.onEntering(args);
  }

  onUpdate(stateName: StateName, args: Record<string, any>): void {
    const { isSpectator } = this.game;

    if (isSpectator) {
      return;
    }

    this.states[stateName]?.onUpdate(args);
  }

  onLeaving(stateName: StateName): void {
    const { isSpectator } = this.game;

    if (isSpectator) {
      return;
    }

    this.states[stateName]?.onLeaving();
  }
}

class State {
  protected readonly game: SCP;

  constructor(game: SCP) {
    this.game = game;
  }

  public onEntering(args: Record<string, any>): void {}

  public onUpdate(args: Record<string, any>): void {}

  public onLeaving(): void {
    this.game.clearButtons();
  }
}

type StateName =
  | "ChooseTheme"
  | "PreTurn"
  | "PlayerTurn"
  | "AttachScene"
  | "AttachGenre"
  | "PlaceAnywhere";
