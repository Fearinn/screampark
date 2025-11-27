class NotifManager {
  private readonly game: SCP;
  private readonly counters: Counters;
  private readonly themeManager: ThemeManager;
  private readonly sceneManager: SceneManager;
  private readonly vipManager: VipManager;

  constructor(game: SCP) {
    this.game = game;
    this.counters = this.game.managers.counters;
    this.themeManager = new ThemeManager(this.game);
    this.sceneManager = new SceneManager(this.game);
    this.vipManager = new VipManager(this.game);
  }

  public setIgnoreChecks() {
    const { notifqueue, player_id } = this.game;

    const notifsToIgnore = [
      "getTheme",
      "dealScenes",
      "placeScene",
      "discardScene",
      "discardBoth",
      "receiveCards",
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

    await hand.addCards(cards, { fromStock: deck });
  }

  public async notif_dealScenes(args: {
    player_id: number;
    cardCount: number;
  }): Promise<void> {
    const { cardCount, player_id: playerId } = args;
    const { fakeHands, deck } = this.sceneManager.stocks;

    const fakeCards: SceneCard[] = [];
    for (let i = 1; i <= cardCount; i++) {
      fakeCards.push({ id: -i, type: "scene" });
    }

    await fakeHands[playerId].addCards(fakeCards, { fromStock: deck });
  }

  public async notif_placeScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards, genreDeck } = this.sceneManager.stocks;

    await boards[playerId].addCard(card, {
      fromStock: card.type === "genre" ? genreDeck : undefined,
    });
  }

  public async notif_placeScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards, genreDeck } = this.sceneManager.stocks;

    await boards[playerId].addCard(card, {
      fromStock: card.type === "genre" ? genreDeck : undefined,
      fromElement:
        card.type === "scene"
          ? document.getElementById(`scp_playerZone-${playerId}`)
          : undefined,
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

  public async notif_discardBothPrivate(args: {
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand } = this.sceneManager.stocks;

    await hand.removeCards(cards, {
      fadeOut: true,
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].removeCard(card, {
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardBoth(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id: playerId, cards } = args;
    const { fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].removeCards(cards, {
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_receiveCardsPrivate(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand } = this.sceneManager.stocks;
    await hand.addCards(cards);
  }

  public async notif_receiveCards(args: {
    player_id: number;
    otherPlayerId: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id: playerId, otherPlayerId, cards } = args;
    const { fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].addCards(cards, {
      fromStock: fakeHands[otherPlayerId],
    });
  }

  public async notif_endDay(args: { previousDay: number }): Promise<void> {
    const { previousDay } = args;
    const { board } = this.vipManager.stocks;
    const card = board.getCards().find((card) => {
      return Number(card.location_arg) === previousDay;
    });
    board.flipCard(card);
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
