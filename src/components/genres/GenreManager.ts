class GenreManager {
  private readonly game: SCP;
  private stocks: GenreStocks;
  private manager: BgaCards.Manager<SCP_Card>;
  private GENRES: GENRE[];

  constructor(game: SCP) {
    this.game = game;
    this.manager = this.game.managers.genres;
    this.stocks = this.game.stocks.genres;
    this.GENRES = this.game.gamedatas.GENRES;
  }

  private build(): void {
    const { managers } = this.game;
    const { animations } = managers;

    this.game.managers.genres = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_genre",
      cardHeight: 285,
      cardWidth: 150,
      cardBorderRadius: "8px",
      setupDiv: ({ type_arg: genre_id }, element) => {
        element.classList.add("scp_card");

        const { label: genre_label } = this.GENRES[genre_id];
        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(_("${genre_label}"), {
            genre_label,
          }),
          ""
        );
      },
      setupFrontDiv: ({ type_arg: genre_id }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/genres/genre_${genre_id}.jpg)`;
      },
    });
    this.manager = this.game.managers.vips;

    this.game.stocks.genres = {
      deck: new BgaCards.Deck(
        managers.genres,
        document.getElementById("scp_genreDeck"),
        {
          sort: (a, b) => {
            return a.location_arg - b.location_arg;
          },
        }
      ),
    };
    this.stocks = this.game.stocks.genres;
  }

  public setup(): void {
    this.build();
    const { deck } = this.stocks;
    Object.keys(this.GENRES).forEach((genre_id) => {
      deck.addCard({
        id: Number(genre_id),
        type: `${genre_id}`,
        type_arg: Number(genre_id),
        location: "deck",
        location_arg: Math.floor(Math.random() * 5) + 1,
      });
    });
  }
}

interface GENRE {
  id: number;
  name: string;
  label: string;
}

interface GenreStocks {
  deck: BgaCards.Deck<SCP_Card>;
}
