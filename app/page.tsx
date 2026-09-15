"use client";

import { useState } from "react";
import { movies } from "./data/movies";

export default function Home() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("boxOffice");

  const filteredMovies = movies
    .filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "rating") {
        return b.rating - a.rating;
      }

      if (sort === "year") {
        return b.year - a.year;
      }

      return b.boxOffice - a.boxOffice;
    });

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <h1 className="text-3xl font-bold tracking-tight">
            🎬 MOVIE RANKING
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Netflixで見られる映画を数字で比較
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Netflix配信映画ランキング
          </h2>

          <p className="mt-2 text-gray-500">
            世界興行収入・評価・公開年から比較
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 映画を検索..."
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-sm outline-none focus:border-gray-400"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSort("boxOffice")}
            className={`rounded-xl px-5 py-3 font-medium transition ${
              sort === "boxOffice"
                ? "bg-black text-white"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            💰 興行収入順
          </button>

          <button
            onClick={() => setSort("rating")}
            className={`rounded-xl px-5 py-3 font-medium transition ${
              sort === "rating"
                ? "bg-black text-white"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            ⭐ 評価順
          </button>

          <button
            onClick={() => setSort("year")}
            className={`rounded-xl px-5 py-3 font-medium transition ${
              sort === "year"
                ? "bg-black text-white"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            📅 新しい順
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          {search
            ? `「${search}」の検索結果：${filteredMovies.length}作品`
            : `${filteredMovies.length}作品を表示中`}
        </div>

        <div className="space-y-4">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie, index) => (
              <a
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center p-5 sm:p-6">
                  <div className="w-12 text-center">
                    <div className="text-3xl font-black text-gray-300">
                      {index + 1}
                    </div>
                  </div>

                  <div className="ml-3 h-28 w-20 shrink-0 overflow-hidden rounded-lg shadow">
                    <img
                      src={movie.poster}
                      alt={`${movie.title} ポスター`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="ml-5 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {movie.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>{movie.year}年公開</span>
                      <span>IMDb ⭐ {movie.rating}</span>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <div className="text-xs text-gray-400">
                      WORLDWIDE BOX OFFICE
                    </div>

                    <div className="mt-1 text-xl font-bold text-gray-900">
                      ${movie.boxOffice}億
                    </div>
                  </div>

                  <div className="ml-5 text-2xl text-gray-300">
                    →
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
              <div className="text-5xl">🎬</div>

              <p className="mt-4 text-lg font-bold text-gray-800">
                映画が見つかりません
              </p>

              <p className="mt-2 text-sm text-gray-500">
                別の映画タイトルで検索してみてください。
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-400">
          MOVIE RANKING
        </footer>
      </div>
    </main>
  );
}