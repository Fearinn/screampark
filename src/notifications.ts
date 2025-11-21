class NotifManager {
  private readonly game: SCP;
  private readonly counters: Counters;
  private readonly themeManager: ThemeManager;
  private readonly sceneManager: SceneManager;

  constructor(game: SCP) {
    this.game = game;
    this.counters = this.game.managers.counters;
    this.themeManager = new ThemeManager(this.game);
    this.sceneManager = new SceneManager(this.game);
  }

  public setIgnoreChecks() {
    const { notifqueue, player_id } = this.game;

    const notifsToIgnore = [
      "getTheme",
      "dealScenes",
      "playScene",
      "discardScene",
      "setCounter",
    ];

    notifsToIgnore.forEach((notifName) => {
      notifqueue.setIgnoreNotificationCheck(
        notifName,
        (notif: Notif<{ player_id: number }>) => {
          const { player_id: playerId } = notif.args;
          return playerId === player_id;
        }
      );
    });
  }

  public async notif_discardTheme(args: {
    player_id: number;
    cardId: number;
  }): Promise<void> {
    const { player_id: playerId, cardId } = args;

    const { boards } = this.themeManager.stocks;

    await boards[playerId].removeCard(
      { id: cardId },
      { fadeOut: true, slideTo: document.getElementById("player_boards") }
    );
  }

  public async notif_getTheme(args: {
    player_id: number;
    cardId: number;
  }): Promise<void> {
    const { player_id: playerId, cardId } = args;
    const { boards } = this.themeManager.stocks;

    await boards[playerId].addCard(
      { id: cardId },
      {
        fromElement: document.getElementById("player_boards"),
      }
    );
  }

  public async notif_getThemePrivate(args: {
    player_id: number;
    card: ThemeCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards } = this.themeManager.stocks;

    await boards[playerId].addCard(card, {
      fromElement: document.getElementById("player_boards"),
    });
  }

  public notif_revealTheme(args: { player_id: number; card: ThemeCard }): void {
    const { player_id: playerId, card } = args;
    const { boards } = this.themeManager.stocks;

    boards[playerId].setCardVisible(card, true);
  }

  public async notif_dealScenesPrivate(args: {
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand, deck } = this.sceneManager.stocks;

    hand.addCards(cards, { fromStock: deck });
  }

  public async notif_dealScenes(args: {
    player_id: number;
    cardCount: number;
  }): Promise<void> {
    const { cardCount, player_id: playerId } = args;
    const { deck } = this.sceneManager.stocks;

    const fakeCards: SceneCard[] = [];
    for (let i = 1; i <= cardCount; i++) {
      fakeCards.push({ id: -i, type: "scene" });
    }

    await deck.addCards(fakeCards);
    await deck.removeCards(fakeCards, {
      slideTo: document.getElementById(`scp_playerZone-${playerId}`),
    });
  }

  public async notif_playScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards } = this.sceneManager.stocks;
    await boards[playerId].addCard(card);
  }

  public async notif_playScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards } = this.sceneManager.stocks;
    await boards[playerId].addCard(card, {
      fromElement: document.getElementById(`scp_playerZone-${playerId}`),
    });
  }

  public async notif_discardScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { card } = args;
    const { hand } = this.sceneManager.stocks;

    await hand.removeCard(card, {
      fadeOut: true,
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { card, player_id: playerId } = args;
    const { boards } = this.sceneManager.stocks;

    card.slot = 1;
    await boards[playerId].addCard(card);
    await boards[playerId].removeCard(card, {
      fadeOut: true,
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_setCounterPrivate(args: {
    player_id: number;
    inc: number;
    name: string;
  }): Promise<void> {
    const { player_id: playerId, inc, name } = args;
    const counter = this.counters[name][playerId];
    counter.incValue(inc);
  }
}
