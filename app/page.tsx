import fs from "fs";
import path from "path";
import Link from "next/link";

type Movie = {
  id: number;
  title: string;
  releaseDate: string;
  revenue: number;
  rating: number;
  poster: string | null;
  overview: string;
};

type YearData = {
  year: number;
  movies: Movie[];
};

function loadAllMovies(): YearData[] {
  const dataDirectory = path.join(
    process.cwd(),
    "app",
    "data",
    "movies"
  );

  if (!fs.existsSync(dataDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(dataDirectory)
    .filter(
      (file) =>
        file.endsWith(".json") && /^\d{4}\.json$/.test(file)
    )
    .sort();

  return files
    .map((file) => {
      const filePath = path.join(dataDirectory, file);

      try {
        const data = JSON.parse(
          fs.readFileSync(filePath, "utf-8")
        );

        const year = Number(file.replace(".json", ""));

        // 現在のJSON形式：
        // [
        //   { id, title, releaseDate, ... },
        //   ...
        // ]
        if (Array.isArray(data)) {
          return {
            year,
            movies: data,
          };
        }

        // 念のため、旧形式にも対応
        // {
        //   year: 2025,
        //   movies: [...]
        // }
        if (data && Array.isArray(data.movies)) {
          return {
            year: data.year ?? year,
            movies: data.movies,
          };
        }

        return {
          year,
          movies: [],
        };
      } catch {
        return {
          year: Number(file.replace(".json", "")),
          movies: [],
        };
      }
    })
    .filter((data) => Number.isInteger(data.year));
}

function formatRevenue(revenue: number) {
  if (revenue >= 1_000_000_000) {
    return `$${(revenue / 1_000_000_000).toFixed(2)}B`;
  }

  if (revenue >= 1_000_000) {
    return `$${(revenue / 1_000_000).toFixed(0)}M`;
  }

  return `$${revenue.toLocaleString()}`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    year?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const allYearData = loadAllMovies();

  const mode = params.mode === "year" ? "year" : "all";

  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 1;

  const requestedYear = Number(params.year);

  const selectedYear =
    mode === "year"
      ? Number.isInteger(requestedYear) &&
        allYearData.some((data) => data.year === requestedYear)
        ? requestedYear
        : allYearData.some((data) => data.year === defaultYear)
        ? defaultYear
        : allYearData.length > 0
        ? Math.max(...allYearData.map((data) => data.year))
        : defaultYear
      : null;

  let movies: Movie[] = [];

  if (mode === "all") {
    movies = allYearData
      .flatMap((data) => data.movies)
      .sort((a, b) => b.revenue - a.revenue);
  } else {
    const yearData = allYearData.find(
      (data) => data.year === selectedYear
    );

    movies = yearData?.movies ?? [];
  }

  const pageSize = 20;

  const requestedPage = Number(params.page);

  const totalPages = Math.max(
    1,
    Math.ceil(movies.length / pageSize)
  );

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= totalPages
      ? requestedPage
      : 1;

  const startIndex = (currentPage - 1) * pageSize;

  const displayedMovies = movies.slice(
    startIndex,
    startIndex + pageSize
  );

  const years = allYearData
    .map((data) => data.year)
    .sort((a, b) => b - a);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-black tracking-tight sm:text-xl"
          >
            MOVIE RANKING
          </Link>

          <div className="text-xs font-medium text-white/50 sm:text-sm">
            NETFLIX JAPAN × WORLDWIDE BOX OFFICE
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-red-950/30 to-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            Netflix Japan × Worldwide Box Office
          </p>

          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Netflixで見られる映画を、
            <br />
            <span className="text-red-500">
              世界興行収入
            </span>
            でランキング。
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            日本のNetflixで視聴できる映画を、世界でどれだけ稼いだかという
            興行収入を基準にランキング。
          </p>
        </div>
      </section>

      {/* Ranking Type */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              mode === "all"
                ? "border-red-500 bg-red-500 text-white"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            総合ランキング
          </Link>

          <Link
            href={`/?mode=year&year=${
              selectedYear ?? defaultYear
            }`}
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              mode === "year"
                ? "border-red-500 bg-red-500 text-white"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            公開年別
          </Link>
        </div>
      </section>

      {/* Year Selector */}
      {mode === "year" && (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80">
                公開年を選択
              </h2>

              <span className="text-xs text-white/40">
                {selectedYear}年
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/?mode=year&year=${year}`}
                  className={`min-w-[72px] rounded-xl border px-3 py-2 text-center text-sm font-bold transition ${
                    year === selectedYear
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {year}年
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ranking */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">
              {mode === "all"
                ? "Overall Ranking"
                : `${selectedYear} Ranking`}
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {mode === "all"
                ? "全ての年の総合ランキング"
                : `${selectedYear}年 公開作品`}
            </h2>
          </div>

          <div className="text-right text-xs text-white/40">
            {movies.length}作品
          </div>
        </div>

        {displayedMovies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-white/50">
              この年代の作品はありません。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMovies.map((movie, index) => {
              const rank = startIndex + index + 1;

              return (
                <Link
                  key={`${movie.id}-${rank}`}
                  href={`/movies/${movie.id}`}
                  className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06] sm:gap-5 sm:p-4"
                >
                  {/* Rank */}
                  <div className="flex w-8 shrink-0 items-start justify-center pt-2 sm:w-10">
                    <span
                      className={`text-lg font-black sm:text-xl ${
                        rank <= 3
                          ? "text-red-500"
                          : "text-white/30"
                      }`}
                    >
                      {rank}
                    </span>
                  </div>

                  {/* Poster */}
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-32 sm:w-24">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/30">
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold sm:text-lg">
                        {movie.title}
                      </h3>

                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50">
                        {movie.releaseDate?.slice(0, 4)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      <span>
                        ★ {movie.rating.toFixed(1)}
                      </span>

                      <span>
                        世界興行収入{" "}
                        <strong className="text-white/80">
                          {formatRevenue(movie.revenue)}
                        </strong>
                      </span>
                    </div>

                    {movie.overview && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
                        {movie.overview}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="hidden items-center text-xl text-white/20 transition group-hover:text-white/60 sm:flex">
                    →
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={
                  mode === "all"
                    ? `/?page=${currentPage - 1}`
                    : `/?mode=year&year=${selectedYear}&page=${
                        currentPage - 1
                      }`
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"
              >
                ←
              </Link>
            )}

            <span className="px-4 text-sm font-bold text-white/50">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={
                  mode === "all"
                    ? `/?page=${currentPage + 1}`
                    : `/?mode=year&year=${selectedYear}&page=${
                        currentPage + 1
                      }`
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"
              >
                →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/30">
        Movie Ranking — Netflix Japan × Worldwide Box Office
      </footer>
    </main>
  );
}