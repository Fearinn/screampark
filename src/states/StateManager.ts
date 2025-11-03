class StateManager {
  protected readonly game: SCP;
  private readonly states: Record<StateName, State> | {};

  constructor(game: SCP) {
    this.game = game;
    this.states = {};
  }

  onEntering(stateName: StateName, args: any): void {
    const { isSpectator, on_client_state } = this.game;

    if (isSpectator) {
      return;
    }
  }

  onUpdate(stateName: StateName, args: any): void {
    const { isSpectator, on_client_state, gamedatas } = this.game;

    if (isSpectator) {
      return;
    }
  }

  onLeaving(stateName: StateName): void {
    const { isSpectator } = this.game;

    if (isSpectator) {
      return;
    }
  }
}

type StateName = "";

class State {
  protected readonly game: SCP;

  constructor(game: SCP) {
    this.game = game;
  }

  public enter(args: any): void {}

  public update(args: any): void {}

  public leave(): void {}
}
