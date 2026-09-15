import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Movie = {
  id: number;
  title: string;
  releaseDate: string;
  revenue: number;
  rating: number;
  poster: string | null;
  overview: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const year = Number(searchParams.get("year"));

    if (!year || year < 1900 || year > 2100) {
      return NextResponse.json(
        {
          success: false,
          message: "yearを正しく指定してください。",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "TMDB_API_KEYが設定されていません。",
        },
        { status: 500 }
      );
    }

    const candidates: any[] = [];

    // ==========================================
    // ① まず1ページ目を取得して総ページ数を確認
    // ==========================================

    const firstPageUrl =
      `https://api.themoviedb.org/3/discover/movie` +
      `?api_key=${apiKey}` +
      `&language=ja-JP` +
      `&watch_region=JP` +
      `&with_watch_providers=8` +
      `&with_watch_monetization_types=flatrate` +
      `&primary_release_year=${year}` +
      `&sort_by=popularity.desc` +
      `&page=1`;

    const firstResponse = await fetch(firstPageUrl);

    if (!firstResponse.ok) {
      throw new Error(
        `TMDB Discover API error: ${firstResponse.status}`
      );
    }

    const firstData = await firstResponse.json();

    const totalPages = firstData.total_pages || 1;

    const totalResults = firstData.total_results || 0;

    // TMDB側のページ上限を考慮
    const pagesToFetch = Math.min(totalPages, 500);

    // 1ページ目
    candidates.push(...(firstData.results || []));

    // ==========================================
    // ② 残りのページを全部取得
    // ==========================================

    for (let page = 2; page <= pagesToFetch; page++) {
      const url =
        `https://api.themoviedb.org/3/discover/movie` +
        `?api_key=${apiKey}` +
        `&language=ja-JP` +
        `&watch_region=JP` +
        `&with_watch_providers=8` +
        `&with_watch_monetization_types=flatrate` +
        `&primary_release_year=${year}` +
        `&sort_by=popularity.desc` +
        `&page=${page}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `TMDB Discover API error on page ${page}: ${response.status}`
        );
      }

      const data = await response.json();

      candidates.push(...(data.results || []));

      // APIへの負荷を少し抑える
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );
    }

    // ==========================================
    // ③ 重複削除
    // ==========================================

    const uniqueCandidates = Array.from(
      new Map(
        candidates.map((movie) => [movie.id, movie])
      ).values()
    );

    const validMovies: Movie[] = [];

    // ==========================================
    // ④ 各映画の詳細情報を取得
    // ==========================================

    for (let i = 0; i < uniqueCandidates.length; i++) {
      const movie = uniqueCandidates[i];

      const detailUrl =
        `https://api.themoviedb.org/3/movie/${movie.id}` +
        `?api_key=${apiKey}` +
        `&language=ja-JP`;

      const detailResponse = await fetch(detailUrl);

      if (!detailResponse.ok) {
        continue;
      }

      const detail = await detailResponse.json();

      // 興行収入が100万ドル未満の作品は除外
      if (!detail.revenue || detail.revenue < 1000000) {
        continue;
      }

      validMovies.push({
        id: detail.id,
        title: detail.title,
        releaseDate: detail.release_date,
        revenue: detail.revenue,
        rating: detail.vote_average,
        poster: detail.poster_path
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
          : null,
        overview: detail.overview,
      });

      // APIへの負荷を少し抑える
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );
    }

    // ==========================================
    // ⑤ 興行収入順に並べる
    // ==========================================

    validMovies.sort(
      (a, b) => b.revenue - a.revenue
    );

    // ==========================================
    // ⑥ 年別JSONとして保存
    // ==========================================

    const dataDirectory = path.join(
      process.cwd(),
      "app",
      "data",
      "movies"
    );

    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, {
        recursive: true,
      });
    }

    const filePath = path.join(
      dataDirectory,
      `${year}.json`
    );

    fs.writeFileSync(
      filePath,
      JSON.stringify(validMovies, null, 2),
      "utf-8"
    );

    return new NextResponse(
      JSON.stringify(
        {
          success: true,
          message: `${year}年のランキングデータを保存しました。`,
          year,
          totalResults,
          totalPages,
          pagesFetched: pagesToFetch,
          candidateCount: uniqueCandidates.length,
          validMovieCount: validMovies.length,
          file: `app/data/movies/${year}.json`,
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new NextResponse(
      JSON.stringify(
        {
          success: false,
          message:
            "映画データの取得中にエラーが発生しました。",
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
        },
      }
    );
  }
}