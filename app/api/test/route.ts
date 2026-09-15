export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "TMDB_API_KEYが設定されていません",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  // Netflix日本で配信されている映画をTMDBから検索
  const discoverResponse = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ja-JP&watch_region=JP&with_watch_providers=8&with_watch_monetization_types=flatrate&sort_by=popularity.desc&page=1`
  );

  if (!discoverResponse.ok) {
    return new Response(
      JSON.stringify({
        error: "Netflix日本の映画一覧取得に失敗しました",
      }),
      {
        status: discoverResponse.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  const discoverData = await discoverResponse.json();

  // Netflix日本の映画から30作品を取得
  const movies = await Promise.all(
    discoverData.results.slice(0, 30).map(async (movie: any) => {
      // 映画詳細を取得
      const detailResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=ja-JP`
      );

      if (!detailResponse.ok) {
        return null;
      }

      const detail = await detailResponse.json();

      // 興行収入がない作品は除外
      if (!detail.revenue || detail.revenue <= 0) {
        return null;
      }

      return {
        id: detail.id,
        title: detail.title,
        releaseDate: detail.release_date,
        rating: detail.vote_average,
        revenue: detail.revenue,
        poster: detail.poster_path
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
          : null,
        overview: detail.overview,
      };
    })
  );

  // 有効な映画だけ残す
  const validMovies = movies.filter((movie) => movie !== null);

  // 世界興行収入の高い順に並べる
  validMovies.sort((a, b) => b.revenue - a.revenue);

  // 順位を付ける
  const ranking = validMovies.map((movie, index) => ({
    rank: index + 1,
    ...movie,
  }));

  return new Response(
    JSON.stringify(
      {
        totalResults: ranking.length,
        ranking,
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}