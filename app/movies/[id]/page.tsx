import type { Metadata } from "next";
import Link from "next/link";

type Movie = {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  rating: number;
  voteCount: number;
  runtime: number | null;
  revenue: number;
  budget: number;
  poster: string | null;
  backdrop: string | null;
  overview: string;
  genres: string[];
};

async function getMovie(id: string): Promise<Movie | null> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEYが設定されていません");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ja-JP`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const movie = await response.json();

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    runtime: movie.runtime,
    revenue: movie.revenue,
    budget: movie.budget,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    backdrop: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : null,
    overview: movie.overview,
    genres: movie.genres?.map((genre: any) => genre.name) ?? [],
  };
}

/* =========================
   SEO
========================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const movie = await getMovie(id);

    if (!movie) {
      return {
        title: "映画が見つかりません | MOVIE RANKING",
        description:
          "指定された映画の情報を取得できませんでした。",
      };
    }

    const title = `${movie.title}｜世界興行収入・評価・映画情報 | MOVIE RANKING`;

    const description = movie.overview
      ? `${movie.title}の世界興行収入、TMDB評価、公開日、上映時間、ジャンルなどの映画情報を紹介。${movie.overview}`
      : `${movie.title}の世界興行収入、TMDB評価、公開日、上映時間、ジャンルなどの映画情報を紹介。`;

    return {
      title,
      description,

      keywords: [
        movie.title,
        movie.originalTitle,
        "映画",
        "映画情報",
        "世界興行収入",
        "興行収入",
        "映画ランキング",
        "MOVIE RANKING",
      ].filter(Boolean),

      openGraph: {
        title,
        description,
        type: "article",
        siteName: "MOVIE RANKING",
        images: movie.backdrop
          ? [
              {
                url: movie.backdrop,
                width: 1280,
                height: 720,
                alt: movie.title,
              },
            ]
          : movie.poster
            ? [
                {
                  url: movie.poster,
                  width: 500,
                  height: 750,
                  alt: movie.title,
                },
              ]
            : undefined,
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: movie.backdrop
          ? [movie.backdrop]
          : movie.poster
            ? [movie.poster]
            : undefined,
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error("SEO metadata error:", error);

    return {
      title: "MOVIE RANKING",
      description:
        "Netflixで見られる映画を世界興行収入順に比較できる映画ランキングサイト。",
    };
  }
}

/* =========================
   表示用関数
========================= */

function formatRevenue(revenue: number) {
  if (!revenue) {
    return "不明";
  }

  return `${(revenue / 100000000).toFixed(2)}億ドル`;
}

function formatRuntime(runtime: number | null) {
  if (!runtime) {
    return "不明";
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) {
    return `${minutes}分`;
  }

  return `${hours}時間${minutes}分`;
}

/* =========================
   ページ
========================= */

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let movie: Movie | null = null;
  let error = "";

  try {
    movie = await getMovie(id);
  } catch (e) {
    console.error(e);
    error = "映画データを取得できませんでした。";
  }

  if (error || !movie) {
    return (
      <main className="min-h-screen bg-gray-100">
        <header className="bg-black text-white">
          <div className="mx-auto max-w-6xl px-6 py-7">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight"
            >
              🎬 MOVIE RANKING
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="text-6xl">😢</div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            映画が見つかりません
          </h1>

          <p className="mt-3 text-gray-500">
            指定された映画の情報を取得できませんでした。
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            ランキングに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight"
          >
            🎬 MOVIE RANKING
          </Link>

          <p className="mt-2 text-sm text-gray-400">
            Netflixで見られる映画を数字で比較
          </p>
        </div>
      </header>

      {/* メイン */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* 戻る */}
        <Link
          href="/"
          className="text-sm font-bold text-gray-500 hover:text-black"
        >
          ← ランキングに戻る
        </Link>

        {/* 映画情報 */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          {/* 背景画像 */}
          {movie.backdrop && (
            <div className="relative h-64 overflow-hidden bg-gray-900 sm:h-80">
              <img
                src={movie.backdrop}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-8 md:flex-row">
              {/* ポスター */}
              <div className="mx-auto w-56 shrink-0 md:mx-0">
                <div className="overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={`${movie.title} ポスター`}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center text-5xl">
                      🎬
                    </div>
                  )}
                </div>
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900">
                  {movie.title}
                </h1>

                {movie.originalTitle &&
                  movie.originalTitle !== movie.title && (
                    <p className="mt-2 text-sm text-gray-400">
                      {movie.originalTitle}
                    </p>
                  )}

                {/* ジャンル */}
                {movie.genres.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* 評価 */}
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="rounded-xl bg-gray-100 px-4 py-3">
                    <div className="text-xs text-gray-400">
                      TMDB SCORE
                    </div>

                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      ⭐ {movie.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-100 px-4 py-3">
                    <div className="text-xs text-gray-400">
                      VOTES
                    </div>

                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      {movie.voteCount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 概要 */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    作品概要
                  </h2>

                  <p className="mt-3 leading-8 text-gray-600">
                    {movie.overview || "作品概要はありません。"}
                  </p>
                </div>
              </div>
            </div>

            {/* 数字で見る映画 */}
            <div className="mt-12 border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                数字で見る映画
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 興行収入 */}
                <div className="rounded-2xl bg-gray-100 p-5">
                  <div className="text-xs font-bold text-gray-400">
                    WORLDWIDE BOX OFFICE
                  </div>

                  <div className="mt-3 text-2xl font-black text-gray-900">
                    {formatRevenue(movie.revenue)}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    世界興行収入
                  </div>
                </div>

                {/* 製作費 */}
                <div className="rounded-2xl bg-gray-100 p-5">
                  <div className="text-xs font-bold text-gray-400">
                    BUDGET
                  </div>

                  <div className="mt-3 text-2xl font-black text-gray-900">
                    {formatRevenue(movie.budget)}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    製作費
                  </div>
                </div>

                {/* 公開日 */}
                <div className="rounded-2xl bg-gray-100 p-5">
                  <div className="text-xs font-bold text-gray-400">
                    RELEASE DATE
                  </div>

                  <div className="mt-3 text-2xl font-black text-gray-900">
                    {movie.releaseDate
                      ? movie.releaseDate.replace(/-/g, "/")
                      : "不明"}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    公開日
                  </div>
                </div>

                {/* 上映時間 */}
                <div className="rounded-2xl bg-gray-100 p-5">
                  <div className="text-xs font-bold text-gray-400">
                    RUNTIME
                  </div>

                  <div className="mt-3 text-2xl font-black text-gray-900">
                    {formatRuntime(movie.runtime)}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    上映時間
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-400">
          MOVIE RANKING
        </footer>
      </div>
    </main>
  );
}