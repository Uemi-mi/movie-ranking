const movieData: {
  [key: string]: {
    title: string;
    year: number;
    boxOffice: string;
    rating: number;
    poster: string;
    director: string;
    cast: string[];
    description: string;
  };
} = {
  avatar: {
    title: "アバター",
    year: 2009,
    boxOffice: "29.2億ドル",
    rating: 7.8,
    poster:
      "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
    director: "ジェームズ・キャメロン",
    cast: ["サム・ワーシントン", "ゾーイ・サルダナ", "シガニー・ウィーバー"],
    description:
      "遠い惑星パンドラを舞台に、人類と先住民族ナヴィの物語を描くSFアドベンチャー。",
  },

  "avengers-endgame": {
    title: "アベンジャーズ／エンドゲーム",
    year: 2019,
    boxOffice: "27.9億ドル",
    rating: 8.4,
    poster:
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    director: "アンソニー・ルッソ / ジョー・ルッソ",
    cast: ["ロバート・ダウニー・Jr.", "クリス・エヴァンス", "クリス・ヘムズワース"],
    description:
      "最凶の敵サノスによって多くの仲間を失ったアベンジャーズが、最後の戦いに挑む。",
  },

  titanic: {
    title: "タイタニック",
    year: 1997,
    boxOffice: "22.6億ドル",
    rating: 7.9,
    poster:
      "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    director: "ジェームズ・キャメロン",
    cast: ["レオナルド・ディカプリオ", "ケイト・ウィンスレット"],
    description:
      "豪華客船タイタニック号を舞台に、身分の違う男女の恋と運命を描いた名作。",
  },

  "star-wars": {
    title: "スター・ウォーズ／フォースの覚醒",
    year: 2015,
    boxOffice: "20.7億ドル",
    rating: 7.8,
    poster:
      "https://image.tmdb.org/t/p/w500/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg",
    director: "J・J・エイブラムス",
    cast: ["デイジー・リドリー", "ジョン・ボイエガ", "ハリソン・フォード"],
    description:
      "銀河を舞台に、新たな世代のヒーローたちが壮大な戦いへ巻き込まれていく。",
  },

  "avengers-infinity-war": {
    title: "アベンジャーズ／インフィニティ・ウォー",
    year: 2018,
    boxOffice: "20.5億ドル",
    rating: 8.4,
    poster:
      "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    director: "アンソニー・ルッソ / ジョー・ルッソ",
    cast: ["ロバート・ダウニー・Jr.", "クリス・ヘムズワース", "ジョシュ・ブローリン"],
    description:
      "インフィニティ・ストーンを集める最凶の敵サノスと、ヒーローたちの壮絶な戦いを描く。",
  },
};

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = movieData[id];

  if (!movie) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl">🎬</div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            映画が見つかりません
          </h1>
          <p className="mt-2 text-gray-500">
            指定された映画は登録されていません。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight hover:text-gray-300"
          >
            🎬 MOVIE RANKING
          </a>
        </div>
      </header>

      {/* 映画詳細 */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* 戻る */}
        <a
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← ランキングに戻る
        </a>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* ポスター */}
            <div className="bg-gray-900 p-8 md:w-80">
              <img
                src={movie.poster}
                alt={`${movie.title} ポスター`}
                className="mx-auto w-56 rounded-xl shadow-lg"
              />
            </div>

            {/* 基本情報 */}
            <div className="flex-1 p-8">
              <div className="text-sm font-medium text-gray-400">
                MOVIE INFORMATION
              </div>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {movie.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                  {movie.year}年公開
                </span>

                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                  ⭐ IMDb {movie.rating}
                </span>
              </div>

              {/* 興行収入 */}
              <div className="mt-8 rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">
                  世界興行収入
                </div>

                <div className="mt-1 text-3xl font-black text-gray-900">
                  {movie.boxOffice}
                </div>
              </div>

              {/* 監督 */}
              <div className="mt-7">
                <div className="text-sm text-gray-400">
                  DIRECTOR
                </div>

                <div className="mt-1 font-semibold text-gray-900">
                  {movie.director}
                </div>
              </div>

              {/* キャスト */}
              <div className="mt-6">
                <div className="text-sm text-gray-400">
                  CAST
                </div>

                <div className="mt-1 text-gray-800">
                  {movie.cast.join(" / ")}
                </div>
              </div>
            </div>
          </div>

          {/* 作品紹介 */}
          <div className="border-t border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900">
              作品紹介
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-10 max-w-5xl border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-400">
        MOVIE RANKING
      </footer>
    </main>
  );
}