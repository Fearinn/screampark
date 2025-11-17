class StateManager {
  protected readonly game: SCP;
  private readonly states: Record<StateName, State> | {};

  constructor(game: SCP) {
    this.game = game;
    this.states = {
      ChooseTheme: new ChooseTheme(this.game),
    };
  }

  onEntering(stateName: StateName, args: Record<string, any>): void {
    const { isSpectator, on_client_state } = this.game;

    if (isSpectator) {
      return;
    }

    this.states[stateName]?.onEntering(args);
  }

  onUpdate(stateName: StateName, args: Record<string, any>): void {
    const { isSpectator, on_client_state } = this.game;

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

type StateName = "ChooseTheme";

class State {
  protected readonly game: SCP;

  constructor(game: SCP) {
    this.game = game;
  }

  public onEntering(args: Record<string, any>): void {}

  public onUpdate(args: Record<string, any>): void {}

  public onLeaving(): void {}
}
